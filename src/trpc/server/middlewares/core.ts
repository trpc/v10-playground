import { ProcedureResultError, MaybePromise } from '../procedure';
const middlewareMarker = Symbol('middlewareMarker');

///////// middleware implementation ///////////
interface MiddlewareNextResultBase<TParams> {
  /**
   * If the resolver is a middleware, it should pass through their `next()`'s output.
   */
  readonly _next: typeof middlewareMarker;
  TParams: TParams;
}
interface MiddlewareReturnResultBase<_TParams> {
  /**
   * If the resolver is a middleware, it should pass through their `next()`'s output.
   */
  readonly _return: typeof middlewareMarker;
}
export interface MiddlewareNextOKResult<TParams>
  extends MiddlewareNextResultBase<TParams> {}
export interface MiddlewareNextErrorResult<TParams>
  extends MiddlewareNextResultBase<TParams>,
    ProcedureResultError<any> {}

export interface MiddlewareReturnOKResult<TParams>
  extends MiddlewareReturnResultBase<TParams> {}
export interface MiddlewareReturnErrorResult<TParams>
  extends MiddlewareReturnResultBase<TParams>,
    ProcedureResultError<any> {}

export type MiddlewareNextResult<TParams> =
  | MiddlewareNextOKResult<TParams>
  | MiddlewareNextErrorResult<TParams>;

export type MiddlewareReturnResult<TParams> =
  | MiddlewareReturnOKResult<TParams>
  | MiddlewareReturnErrorResult<TParams>;

export type MiddlewareParams<TInputParams> = TInputParams & {
  next: {
    (): Promise<MiddlewareNextResult<TInputParams>>;
    <T>(params: T): Promise<MiddlewareNextResult<T>>;
  };
};

export type Middleware<TInputParams, TNextParams, TResult = never> = (
  params: MiddlewareParams<TInputParams>,
) => MaybePromise<
  MiddlewareNextResult<TNextParams> | MiddlewareReturnResult<TResult>
>;

type ExcludeMiddlewareReturnResult<T> = T extends MiddlewareReturnResult<any>
  ? never
  : T;

export type ExcludeMiddlewareNextResult<T> = T extends MiddlewareNextResult<any>
  ? never
  : T;

export type ExcludeMiddlewareResult<T> = ExcludeMiddlewareReturnResult<
  ExcludeMiddlewareNextResult<T>
>;

export function middlewareResult<T>(_result: T): MiddlewareReturnResult<T> {
  throw new Error('Unimplemented');
}
