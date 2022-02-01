import {
  createRouterWithContext,
  createNewContext,
  pipedResolver,
  zod,
  mergeRouters,
} from '.';

export function initTRPC<TContext>() {
  return {
    /**
     * Create procedure resolver
     */
    resolver: pipedResolver<TContext>(),
    /**
     * Create router
     */
    router: createRouterWithContext<TContext>(),
    /**
     * Helper for creating a new context middleware
     */
    newContext: createNewContext<TContext>(),
    /**
     * Zod middlware
     */
    zod,
    mergeRouters,
  };
}
