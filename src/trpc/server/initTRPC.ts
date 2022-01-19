import {
  createRouterWithContext,
  createUseNewContext,
  pipedResolver,
  useZod,
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
    newContext: createUseNewContext<TContext>(),
    /**
     * Zod middlware
     */
    zod: useZod,
  };
}
