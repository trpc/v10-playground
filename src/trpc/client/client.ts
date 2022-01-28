import type { ProceduresByType } from '../server';

function createRouterProxy<TRouter extends ProceduresByType<any>>() {
  return new Proxy({} as any, {
    get(_, type: string) {
      return new Proxy({} as any, {
        get(_, path: string) {
          return type + '.' + path;
        },
      });
    },
  }) as any as TRouter;
}

export function createClient<TRouter extends ProceduresByType<any>>(): TRouter {
  const proxy = createRouterProxy<TRouter>();

  return proxy as any;
}
