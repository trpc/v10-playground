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

export interface TRPCClient<TRouter extends ProceduresByType<any>> {
  query: NonNullable<TRouter['queries']>;
  mutation: NonNullable<TRouter['mutations']>;
  $query: never; // Observable version of query?
}

export function createClient<
  TRouter extends ProceduresByType<any>,
>(): TRPCClient<TRouter> {
  const proxy = createRouterProxy<TRouter>();

  return proxy as any;
}
