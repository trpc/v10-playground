import { createRouterWithContext, mergeRouters } from './router';
import { createBuilder as createProcedure } from './procedure';
import { createMiddlewareFactory } from './middleware';

export function initTRPC<TContext>() {
  return {
    /**
     * Builder object for creating procedures
     */
    procedure: createProcedure<TContext>(),
    /**
     * Create reusable middlewares
     */
    middleware: createMiddlewareFactory<TContext>(),
    /**
     * Create a router
     */
    router: createRouterWithContext<TContext>(),
    /**
     * Merge Routers
     */
    mergeRouters,
  };
}
