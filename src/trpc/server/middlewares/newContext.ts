import {
  MaybePromise,
  MiddlewareFunction,
  Params,
  ProcedureResultError,
} from '..';
import { IsProcedureResultErrorLike } from './zod';

/**
 * Utility for creating a middleware that swaps the context around
 */
export function createNewContext<TInputContext>() {
  return function newContextFactory<
    TNewContext,
    TError extends ProcedureResultError,
  >(
    newContextCallback: (
      params: Params<TInputContext>,
    ) => MaybePromise<
      { ctx: TNewContext } | IsProcedureResultErrorLike<TError>
    >,
  ) {
    return function newContext<TInputParams extends {}>(): MiddlewareFunction<
      TInputParams,
      Omit<TInputParams, 'ctx'> & { ctx: NonNullable<TNewContext> },
      TError
    > {
      return async (params) => {
        const result = await newContextCallback(params as any);

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
