import { createRouterWithContext, mergeRouters } from './router';
import { createProcedureFactory } from './procedure';
import { createMiddlewareFactory } from './middleware';

export function initTRPC<TContext>() {
  return {
    /**
     * Create procedure resolver
     */
    procedure: createProcedureFactory<TContext>()(),
    /**
     * Create router
     */
    router: createRouterWithContext<TContext>(),
    mergeRouters,
    middleware: createMiddlewareFactory<TContext>(),
  };
}
