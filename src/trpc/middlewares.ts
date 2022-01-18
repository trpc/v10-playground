import { z } from 'zod';
import {
  InputSchema,
  MaybePromise,
  MiddlewareFunction,
  Params,
  ProcedureResultError,
} from './';

/***
 * Utility for creating a zod middleware
 */
export function zodMiddleware<TInputParams, TSchema extends z.ZodTypeAny>(
  schema: TSchema,
): MiddlewareFunction<
  TInputParams,
  TInputParams & InputSchema<z.input<TSchema>, z.output<TSchema>>,
  { error: { code: 'BAD_REQUEST'; zod: z.ZodFormattedError<z.input<TSchema>> } }
> {
  type zInput = z.input<TSchema>;
  type zOutput = z.output<TSchema>;
  return async function parser(params) {
    const rawInput: zInput = (params as any).rawInput;
    const result: z.SafeParseReturnType<zInput, zOutput> =
      await schema.safeParseAsync(rawInput);

    if (result.success) {
      return params.next({
        ...params,
        input: result,
        _input_in: null as any,
        _input_out: null as any,
      });
    }

    const zod = (result as z.SafeParseError<zInput>).error.format();
    return {
      error: {
        code: 'BAD_REQUEST',
        zod,
      },
    };
  };
}
/**
 * Utility for creating a middleware that swaps the context around
 * FIXME: this does not correctly infer the `TError` from the callback
 */
export function contextSwapperMiddleware<TInputContext>() {
  return function factory<TNewContext, TError extends ProcedureResultError>(
    newContext: (
      params: Params<TInputContext>,
    ) => MaybePromise<{ ctx: TNewContext } | TError>,
  ) {
    return function middleware<TInputParams extends {}>(): MiddlewareFunction<
      TInputParams,
      Omit<TInputParams, 'ctx'> & { ctx: NonNullable<TNewContext> },
      TError
    > {
      return async (params) => {
        const result = await newContext(params as any);

        if ('ctx' in result) {
          return params.next({
            ...params,
            ctx: result.ctx!,
          });
        }
        return result;
      };
    };
  };
}
