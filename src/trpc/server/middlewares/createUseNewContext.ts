import {
  MaybePromise,
  MiddlewareFunction,
  Params,
  ProcedureResultError,
} from '..';
import { IsProcedureResultErrorLike } from './useZod';

/**
 * Utility for creating a middleware that swaps the context around
 */
export function createUseNewContext<TInputContext>() {
  return function useNewContextFactory<
    TNewContext,
    TError extends ProcedureResultError,
  >(
    newContext: (
      params: Params<TInputContext>,
    ) => MaybePromise<
      { ctx: TNewContext } | IsProcedureResultErrorLike<TError>
    >,
  ) {
    return function useContextSwapper<
      TInputParams extends {},
    >(): MiddlewareFunction<
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
