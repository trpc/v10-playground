import {
  createRouterWithContext,
  createNewContext,
  pipedResolver,
  zod,
  merge,
  Params,
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
     * Helper for creating a new context
     */
    newContext: createNewContext<Params<TContext>>(),
    /**
     * Zod middlware
     */
    zod,
    merge: merge<TContext>(),
  };
}
