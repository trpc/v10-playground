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
  TInputParams,
  TNextParams,
  TResult extends ProcedureResult,
> = (params: TInputParams) => MaybePromise<TNextParams | TResult>;

export interface Params<TContext> {
  ctx: TContext;
  rawInput?: unknown;
}
type OnlyProcedureResult<T> = T extends ProcedureResult ? T : never;

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

  function middlewares<TResult extends ProcedureResult>(
    resolver: Procedure<TBaseParams, TBaseParams, TResult>,
  ): Procedure<TBaseParams, TBaseParams, TResult>;
  function middlewares<
    TResult extends ProcedureResult,
    MW1Params extends TBaseParams = TBaseParams,
    MW1Result extends ProcedureResult = never,
  >(
    middleware1: Procedure<TBaseParams, MW1Params, MW1Result>,
    resolver: Procedure<MW1Params, MW1Params, TResult>,
  ): Procedure<
    TBaseParams,
    MW1Params,
    OnlyProcedureResult<TResult | MW1Result>
  >;
  function middlewares<
    TResult extends ProcedureResult,
    MW1Params extends TBaseParams = TBaseParams,
    MW1Result extends ProcedureResult = never,
    MW2Params extends TBaseParams = MW1Params,
    MW2Result extends ProcedureResult = never,
  >(
    middleware1: Procedure<TBaseParams, MW1Params, MW1Result>,
    middleware2: Procedure<MW1Params, MW2Params, MW2Result>,
    resolver: Procedure<MW2Params, MW1Params, TResult>,
  ): Procedure<
    TBaseParams,
    MW2Params,
    OnlyProcedureResult<TResult | MW1Result | MW2Result>
  >;
  function middlewares(..._args: any): any {
    throw new Error('Unimplemented');
  }

  return middlewares;
}
