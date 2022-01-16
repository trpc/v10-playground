import { z } from "zod";
import { expectTypeOf } from "expect-type";

const middlewareMarker = Symbol("middlewareMarker");

///////////// utils //////////////
export type MaybePromise<T> = T | Promise<T>;

/**
 * JSON-RPC 2.0 Error codes
 *
 * `-32000` to `-32099` are reserved for implementation-defined server-errors.
 * For tRPC we're copying the last digits of HTTP 4XX errors.
 */
export const TRPC_ERROR_CODES_BY_KEY = {
  /**
   * Invalid JSON was received by the server.
   * An error occurred on the server while parsing the JSON text.
   */
  PARSE_ERROR: -32700,
  /**
   * The JSON sent is not a valid Request object.
   */
  BAD_REQUEST: -32600, // 400
  /**
   * Internal JSON-RPC error.
   */
  INTERNAL_SERVER_ERROR: -32603,
  // Implementation specific errors
  UNAUTHORIZED: -32001, // 401
  FORBIDDEN: -32003, // 403
  NOT_FOUND: -32004, // 404
  METHOD_NOT_SUPPORTED: -32005, // 405
  TIMEOUT: -32008, // 408
  PRECONDITION_FAILED: -32012, // 412
  PAYLOAD_TOO_LARGE: -32013, // 413
  CLIENT_CLOSED_REQUEST: -32099 // 499
} as const;

type ErrorCode = keyof typeof TRPC_ERROR_CODES_BY_KEY;

//////// response shapes //////////

interface ProcedureResultSuccess {
  data?: unknown;
}
interface ResultErrorData {
  code: ErrorCode;
  cause?: Error;
}
interface ProcedureResultError {
  error: ResultErrorData;
}

type ProcedureResult = ProcedureResultSuccess | ProcedureResultError;

///////// middleware implementation ///////////
interface MiddlewareResultBase<TParams> {
  /**
   * All middlewares should pass through their `next()`'s output.
   * Requiring this marker makes sure that can't be forgotten at compile-time.
   */
  readonly marker: typeof middlewareMarker;
  TParams: TParams;
}

interface MiddlewareOKResult<TParams>
  extends MiddlewareResultBase<TParams>,
    ProcedureResultSuccess {}

interface MiddlewareErrorResult<TParams>
  extends MiddlewareResultBase<TParams>,
    ProcedureResultError {}

type MiddlewareResult<TParams> =
  | MiddlewareOKResult<TParams>
  | MiddlewareErrorResult<TParams>;

type MiddlewareFunctionParams<TInputParams> = TInputParams & {
  next: {
    (): Promise<MiddlewareResult<TInputParams>>;
    <T>(params: T): Promise<MiddlewareResult<T>>;
  };
};
type MiddlewareFunction<
  TInputParams,
  TNextParams,
  TResult extends ProcedureResult = never
> = (
  params: MiddlewareFunctionParams<TInputParams>
) => Promise<MiddlewareResult<TNextParams> | TResult> | TResult;

type Resolver<TParams, TResult extends ProcedureResult> = (
  params: TParams
) => MaybePromise<TResult>;

interface Params<TContext> {
  ctx: TContext;
  rawInput?: unknown;
}

type ExcludeMiddlewareResult<T> = T extends MiddlewareResult<any> ? never : T;

type ProcedureCall<TBaseParams, ResolverResult> = (
  params: TBaseParams
) => MaybePromise<ResolverResult>;

type ProcedureMeta<TParams> = {
  /**
   * @internal
   */
  _params: TParams;
};

type ProcedureCallWithMeta<TBaseParams, TParams, TResult> = ProcedureCall<
  TBaseParams,
  TResult
> &
  ProcedureMeta<TParams>;
// interface Procedure<TBaseParams, ResolverParams, ResolverResult> {
//   /**
//    * @internal
//    * @deprecated
//    */
//   _params: ResolverParams;
//   call(params: TBaseParams): MaybePromise<ResolverResult>;
// }

function pipedResolver<TContext>() {
  type TBaseParams = Params<TContext>;

  function middlewares<TResult extends ProcedureResult>(
    resolver: Resolver<TBaseParams, TResult>
  ): ProcedureCallWithMeta<TBaseParams, TBaseParams, TResult>;
  function middlewares<
    TResult extends ProcedureResult,
    MW1Params extends TBaseParams = TBaseParams,
    MW1Result extends ProcedureResult = never
  >(
    middleware1: MiddlewareFunction<TBaseParams, MW1Params, MW1Result>,
    resolver: Resolver<MW1Params, TResult>
  ): ProcedureCallWithMeta<
    TBaseParams,
    MW1Params,
    ExcludeMiddlewareResult<TResult | MW1Result>
  >;
  function middlewares<
    TResult extends ProcedureResult,
    MW1Params extends TBaseParams = TBaseParams,
    MW1Result extends ProcedureResult = never,
    MW2Params extends TBaseParams = MW1Params,
    MW2Result extends ProcedureResult = never
  >(
    middleware1: MiddlewareFunction<TBaseParams, MW1Params, MW1Result>,
    middleware2: MiddlewareFunction<MW1Params, MW2Params, MW2Result>,
    resolver: Resolver<MW2Params, TResult>
  ): ProcedureCallWithMeta<
    TBaseParams,
    MW2Params,
    ExcludeMiddlewareResult<TResult | MW1Result | MW2Result>
  >;
  function middlewares(...args: any): any {
    throw new Error("Unimplemented");
  }

  return middlewares;
}
///////////// inference helpers //////////
type ExcludeErrorLike<T> = T extends ProcedureResultError ? never : T;
type OnlyErrorLike<T> = T extends ProcedureResultError ? T : never;

interface ProcedureDefinition<TContext, TInputIn, TInputOut, TResult>
  extends InputSchema<TInputIn, TInputOut> {
  ctx: TContext;
  result: TResult;
  data: ExcludeErrorLike<TResult>;
  errors: OnlyErrorLike<TResult>;
}
type inferParamsInput<TParams> = TParams extends InputSchema<
  infer TBefore,
  infer TAfter
>
  ? InputSchema<TBefore, TAfter>
  : InputSchema<undefined, undefined>;

type inferProcedureParams<
  TProcedure extends ProcedureCall<any, any>
> = TProcedure extends ProcedureCallWithMeta<any, infer TParams, any>
  ? TParams
  : TProcedure extends ProcedureCall<any, infer TParams>
  ? TParams
  : never;

type inferProcedureResult<
  TProcedure extends ProcedureCall<any, any>
> = TProcedure extends ProcedureCall<any, infer TResult> ? TResult : never;

type inferProcedure<
  TProcedure extends ProcedureCall<any, any>
> = ProcedureDefinition<
  inferProcedureParams<TProcedure>["ctx"],
  inferParamsInput<inferProcedureParams<TProcedure>>["_input_in"],
  inferParamsInput<inferProcedureParams<TProcedure>>["_input_out"],
  inferProcedureResult<TProcedure>
>;

///////////// reusable middlewares /////////
interface InputSchema<TInput, TOutput> {
  /**
   * Value before potential data transform like zod's `transform()`
   * @internal
   */
  _input_in: TInput;
  /**
   * Value after potential data transform
   * @internal
   */
  _input_out: TOutput;

  /**
   * Transformed and run-time validate input value
   */
  input: TOutput;
}
/***
 * Utility for creating a zod middleware
 */
function zod<TInputParams, TSchema extends z.ZodTypeAny>(
  schema: TSchema
): MiddlewareFunction<
  TInputParams,
  TInputParams & InputSchema<z.input<TSchema>, z.output<TSchema>>,
  { error: { code: "BAD_REQUEST"; zod: z.ZodFormattedError<z.input<TSchema>> } }
> {
  type zInput = z.input<TSchema>;
  type zOutput = z.output<TSchema>;
  return async function parser(params) {
    const rawInput: zInput = (params as any).rawInput;
    const result: z.SafeParseReturnType<
      zInput,
      zOutput
    > = await schema.safeParseAsync(rawInput);

    if (result.success) {
      return params.next({
        ...params,
        input: result,
        _input_in: null as any,
        _input_out: null as any
      });
    }

    const zod = (result as z.SafeParseError<zInput>).error.format();
    return {
      error: {
        code: "BAD_REQUEST",
        zod
      }
    };
  };
}

/**
 * Utility for creating a middleware that swaps the context around
 * FIXME: this does not correctly infer the `TError` from the callback
 */
function contextSwapper<TInputContext>() {
  return function factory<TNewContext, TError extends ProcedureResultError>(
    newContext: (
      params: Params<TInputContext>
    ) => MaybePromise<{ ctx: TNewContext } | TError>
  ) {
    return function middleware<TInputParams extends {}>(): MiddlewareFunction<
      TInputParams,
      Omit<TInputParams, "ctx"> & { ctx: NonNullable<TNewContext> },
      TError
    > {
      return async (params) => {
        const result = await newContext(params as any);

        if ("ctx" in result) {
          return params.next({
            ...params,
            ctx: result.ctx!
          });
        }
        return result;
      };
    };
  };
}

////////////////////// app ////////////////////////////

// boilerplate for each app, in like a utils
const pipe = pipedResolver<TestContext>();
const swapContext = contextSwapper<TestContext>();

// context
type TestContext = {
  user?: {
    id: string;
  };
};

////////// app middlewares ////////
const isAuthed = swapContext((params) => {
  if (!params.ctx.user) {
    return {
      error: {
        code: "UNAUTHORIZED"
      }
    };
  }
  return {
    ctx: {
      ...params.ctx,
      user: params.ctx.user
    }
  };
});

/////////// app resolvers //////////
{
  // creating a resolver that only has response data
  const data = pipe(() => {
    return {
      data: "ok"
    };
  });
}

{
  // creating a resolver with a set of reusable middlewares
  const myProcedure = pipe(
    // adds zod input validation
    zod(
      z.object({
        hello: z.string(),
        lengthOf: z.string().transform((s) => s.length)
      })
    ),
    // swaps context to make sure the user is authenticated
    // FIXME:
    isAuthed(),
    // manual version of the `isAuthed()` above
    // async (params) => {
    //   if (!params.ctx.user) {
    //     return {
    //       error: {
    //         code: 'UNAUTHORIZED',
    //       },
    //     };
    //   }
    //   return params.next({
    //     ...params,
    //     ctx: {
    //       ...params.ctx,
    //       user: params.ctx.user,
    //     },
    //   });
    // },
    (params) => {
      type TContext = typeof params.ctx;
      type TInput = typeof params.input;
      expectTypeOf<TContext>().toMatchTypeOf<{ user: { id: string } }>();
      expectTypeOf<TInput>().toMatchTypeOf<{
        hello: string;
        lengthOf: number;
      }>();

      if (Math.random() > 0.5) {
        return {
          error: {
            code: "INTERNAL_SERVER_ERROR" as const
          }
        };
      }
      return {
        data: {
          greeting: "hello " + params.ctx.user.id ?? params.input.hello
        }
      };
    }
  );

  async function main() {
    // if you hover result we can see that we can infer both the result and every possible expected error
    const result = await myProcedure({ ctx: {} });
    if ("error" in result && result.error) {
      console.log(result.error);
      if ("zod" in result.error) {
        // zod error inferred - useful for forms w/o libs
        console.log(result.error.zod.hello);
      }
    } else {
      console.log(result.data);
    }
    type MyProcedure = inferProcedure<typeof myProcedure>;

    expectTypeOf<MyProcedure["ctx"]>().toMatchTypeOf<{
      user: { id: string };
    }>();

    expectTypeOf<MyProcedure["data"]>().toMatchTypeOf<{
      data: {
        greeting: string;
      };
    }>();

    expectTypeOf<MyProcedure["_input_in"]>().toMatchTypeOf<{
      hello: string;
      lengthOf: string;
    }>();
    expectTypeOf<MyProcedure["_input_out"]>().toMatchTypeOf<{
      hello: string;
      lengthOf: number;
    }>();
  }
}
