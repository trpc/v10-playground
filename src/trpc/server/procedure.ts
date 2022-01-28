import { ExcludeErrorLike, inferProcedureArgs, OnlyErrorLike } from '.';
import { Middleware } from './middlewares/core';
import { TRPC_ERROR_CODE_KEY } from './rpc';

const errorMarker = Symbol('errorMarker');
///////////// utils //////////////

export type MaybePromise<T> = T | Promise<T>;

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
export type Resolver<TInputParams, TResult = never> = (
  params: TInputParams,
) => MaybePromise<TResult>;

export interface Params<TContext> {
  ctx: TContext;
  rawInput?: unknown;
}

export interface ProcedureOKResult<T> {
  ok: true;
  data: T;
  error?: undefined;
}
export interface ProcedureErrorResult<T> {
  ok: false;
  error: T;
  data?: undefined;
}

export type ProcedureResult<T> =
  | ProcedureOKResult<ExcludeErrorLike<T>>
  | ProcedureErrorResult<OnlyErrorLike<T>['error']>;

export type Procedure<_TBaseParams, TParams, TResult> = (
  ...args: inferProcedureArgs<TParams>
) => Promise<ProcedureResult<TResult>>;

export function pipedResolver<TContext>() {
  type TBaseParams = Params<TContext>;

  function middlewares<TResult>(
    resolver: Resolver<TBaseParams, TResult>,
  ): Procedure<TBaseParams, TBaseParams, TResult>;
  function middlewares<
    TResult,
    MW1Params extends TBaseParams = TBaseParams,
    MW1Result = never,
  >(
    middleware1: Middleware<TBaseParams, MW1Params, MW1Result>,
    resolver: Resolver<MW1Params, TResult>,
  ): Procedure<TBaseParams, MW1Params, TResult | MW1Result>;
  function middlewares<
    TResult,
    MW1Params extends TBaseParams = TBaseParams,
    MW1Result = never,
    MW2Params extends TBaseParams = MW1Params,
    MW2Result = never,
  >(
    middleware1: Middleware<TBaseParams, MW1Params, MW1Result>,
    middleware2: Middleware<MW1Params, MW2Params, MW2Result>,
    resolver: Resolver<MW2Params, TResult>,
  ): Procedure<TBaseParams, MW2Params, TResult | MW1Result | MW2Result>;
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
