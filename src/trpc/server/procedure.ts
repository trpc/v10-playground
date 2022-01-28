import { inferProcedureArgs } from '.';
import { TRPC_ERROR_CODE_KEY } from './rpc';

const middlewareMarker = Symbol('middlewareMarker');
const errorMarker = Symbol('errorMarker');
///////////// utils //////////////

export type MaybePromise<T> = T | Promise<T>;
/**
 * JSON-RPC 2.0 Error codes
 *
 * `-32000` to `-32099` are reserved for implementation-defined server-errors.
 * For tRPC we're copying the last digits of HTTP 4XX errors.
 */
//////// response shapes //////////

export interface ResultErrorData {
  code: TRPC_ERROR_CODE_KEY;
}
export interface ProcedureResultError<
  TResultErrorData extends ResultErrorData,
> {
  readonly _error: typeof errorMarker;
  error: TResultErrorData;
}
///////// middleware implementation ///////////
interface MiddlewareResultBase<TParams> {
  /**
   * All middlewares should pass through their `next()`'s output.
   * Requiring this marker makes sure that can't be forgotten at compile-time.
   */
  readonly _middleware: typeof middlewareMarker;
  TParams: TParams;
}
export interface MiddlewareOKResult<TParams>
  extends MiddlewareResultBase<TParams> {}
export interface MiddlewareErrorResult<TParams>
  extends MiddlewareResultBase<TParams>,
    ProcedureResultError<any> {}
export type MiddlewareResult<TParams> =
  | MiddlewareOKResult<TParams>
  | MiddlewareErrorResult<TParams>;
export type MiddlewareFunctionParams<TInputParams> = TInputParams & {
  next: {
    (): Promise<MiddlewareResult<TInputParams>>;
    <T>(params: T): Promise<MiddlewareResult<T>>;
  };
};
export type MiddlewareFunction<TInputParams, TNextParams, TResult = never> = (
  params: MiddlewareFunctionParams<TInputParams>,
) => Promise<MiddlewareResult<TNextParams> | TResult> | TResult;

export interface Params<TContext> {
  ctx: TContext;
  rawInput?: unknown;
}

type ExcludeMiddlewareResult<T> = T extends MiddlewareResult<any> ? never : T;
export type Procedure<_TBaseParams, TParams, TResult> = (
  ...args: inferProcedureArgs<TParams>
) => MaybePromise<TResult>;

export function pipedResolver<TContext>() {
  type TBaseParams = Params<TContext>;

  function middlewares<TResult>(
    resolver: MiddlewareFunction<TBaseParams, never, TResult>,
  ): Procedure<TBaseParams, TBaseParams, TResult>;
  function middlewares<
    TResult,
    MW1Params extends TBaseParams = TBaseParams,
    MW1Result = never,
  >(
    middleware1: MiddlewareFunction<TBaseParams, MW1Params, MW1Result>,
    resolver: MiddlewareFunction<MW1Params, never, TResult>,
  ): Procedure<
    TBaseParams,
    MW1Params,
    ExcludeMiddlewareResult<TResult | MW1Result>
  >;
  function middlewares<
    TResult,
    MW1Params extends TBaseParams = TBaseParams,
    MW1Result = never,
    MW2Params extends TBaseParams = MW1Params,
    MW2Result = never,
  >(
    middleware1: MiddlewareFunction<TBaseParams, MW1Params, MW1Result>,
    middleware2: MiddlewareFunction<MW1Params, MW2Params, MW2Result>,
    resolver: MiddlewareFunction<MW2Params, never, TResult>,
  ): Procedure<
    TBaseParams,
    MW2Params,
    ExcludeMiddlewareResult<TResult | MW1Result | MW2Result>
  >;
  function middlewares(..._args: any): any {
    throw new Error('Unimplemented');
  }

  return middlewares;
}

export function error<T extends ResultErrorData>(
  err: T,
): ProcedureResultError<T> {
  return {
    error: err,
    _error: errorMarker,
  };
}
