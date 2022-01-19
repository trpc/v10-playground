import {
  MaybePromise,
  MiddlewareFunction,
  Params,
  ProcedureResultError,
} from '..';
import { IsProcedureResultErrorLike } from './zodMiddleware';

/**
 * Utility for creating a middleware that swaps the context around
 */
export function contextSwapperMiddleware<TInputContext>() {
  return function factory<TNewContext, TError extends ProcedureResultError>(
    newContext: (
      params: Params<TInputContext>,
    ) => MaybePromise<
      { ctx: TNewContext } | IsProcedureResultErrorLike<TError>
    >,
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
