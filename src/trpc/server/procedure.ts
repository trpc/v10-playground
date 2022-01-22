import { TRPC_ERROR_CODE_KEY } from './rpc';

///////////// utils //////////////

export type MaybePromise<T> = T | Promise<T>;
/**
 * JSON-RPC 2.0 Error codes
 *
 * `-32000` to `-32099` are reserved for implementation-defined server-errors.
 * For tRPC we're copying the last digits of HTTP 4XX errors.
 */
//////// response shapes //////////
export interface ProcedureResultSuccess {
  data?: unknown;
}
export interface ResultErrorData {
  code: TRPC_ERROR_CODE_KEY;
}
export interface ProcedureResultError {
  error: ResultErrorData;
}
export type ProcedureResult = ProcedureResultSuccess | ProcedureResultError;

export type Procedure<
  TInputParams extends Params<unknown>,
  TNextParams,
  TResult extends ProcedureResult,
> = (params: TInputParams) => MaybePromise<TNextParams | TResult>;

export interface Params<TContext> {
  ctx: TContext;
  rawInput?: unknown;
}
type OnlyProcedureResult<T> = T extends ProcedureResult
  ? ProcedureResult extends T
    ? never
    : T
  : never;

/**
 * @internal
 */
export type ProcedureMeta<TParams> = {
  /**
   * @internal
   */
  _params: TParams;
};

export function pipedResolver<TContext>() {
  type TBaseParams = Params<TContext>;

  function pipe<TResult extends ProcedureResult>(
    procedure1: Procedure<TBaseParams, TBaseParams, TResult>,
  ): Procedure<TBaseParams, TBaseParams, TResult>;
  function pipe<
    TResult extends ProcedureResult,
    P1Params extends TBaseParams = TBaseParams,
    P1Result extends ProcedureResult = never,
  >(
    procedure1: Procedure<TBaseParams, P1Params, P1Result>,
    procedure2: Procedure<P1Params, never, TResult>,
  ): Procedure<TBaseParams, P1Params, OnlyProcedureResult<TResult | P1Result>>;
  function pipe<
    TResult extends ProcedureResult,
    P1Params extends TBaseParams = TBaseParams,
    P1Result extends ProcedureResult = never,
    P2Params extends P1Params = P1Params,
    P2Result extends ProcedureResult = never,
  >(
    procedure1: Procedure<TBaseParams, P1Params, P1Result>,
    procedure2: Procedure<P1Params, P2Params, P2Result>,
    procedure3: Procedure<P2Params, never, TResult>,
  ): Procedure<
    TBaseParams,
    P2Params,
    OnlyProcedureResult<TResult | P1Result | P2Result>
  >;
  function pipe(..._args: any): any {
    throw new Error('Unimplemented');
  }

  return pipe;
}

// export type ObservableInput<T> =
//   | Observable<T>
//   | InteropObservable<T>
//   | AsyncIterable<T>
//   | PromiseLike<T>
//   | ArrayLike<T>
//   | Iterable<T>
//   | ReadableStreamLike<T>;

// export type ObservableInputTuple<T> = {
//   [K in keyof T]: ObservableInput<T[K]>;
// };

// export function mergeWith<T, A extends readonly unknown[]>(
//   ...otherSources: [...ObservableInputTuple<A>]
// ): OperatorFunction<T, T | A[number]> {
//   return merge(...otherSources);
// }

export function merge<TContext>() {
  type TBaseParams = Params<TContext>;
  function _merge<
    P1Params extends TBaseParams = TBaseParams,
    P1Result extends ProcedureResult = never,
    P2Params extends P1Params = P1Params,
    P2Result extends ProcedureResult = never,
    P3Params extends P2Params = P2Params,
    P3Result extends ProcedureResult = never,
  >(
    procedure1: Procedure<TBaseParams, P1Params, OnlyProcedureResult<P1Result>>,
    procedure2: Procedure<P1Params, P2Params, OnlyProcedureResult<P2Result>>,
    procedure3: Procedure<P2Params, P3Params, OnlyProcedureResult<P3Result>>,
  ): () => Procedure<
    TBaseParams,
    P3Params,
    OnlyProcedureResult<P1Result | P2Result | P3Result>
  >;
  function _merge(..._args: any): any {
    throw new Error('Unimplemented');
  }
  return _merge;
}
