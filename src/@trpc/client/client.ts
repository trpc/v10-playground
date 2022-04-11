import type { Router } from '../server';

function createRouterProxy<TRouter extends Router<any>>() {
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

export interface TRPCClient<TRouter extends Router<any>> {
  query: NonNullable<TRouter['queries']>;
  mutation: NonNullable<TRouter['mutations']>;
  $query: never; // Observable version of query?
}

export function createClient<
  TRouter extends Router<any>,
>(): TRPCClient<TRouter> {
  const proxy = createRouterProxy<TRouter>();

  return proxy as any;
}
