import type { ProceduresByType } from '../server';

export function createRouterProxy<TRouter extends ProceduresByType<any>>() {
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
