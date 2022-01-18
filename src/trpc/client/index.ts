import type {
  ProcedureCall,
  ProcedureCallWithMeta,
  ProceduresByType,
  inferProcedure,
} from '../server';

type ValueOf<T> = T[keyof T];

type inferProcedureArgs<TProcedure extends ProcedureCall<any, any>> =
  inferProcedure<TProcedure>['_input_in'] extends undefined
    ? [inferProcedure<TProcedure>['_input_in']?]
    : [inferProcedure<TProcedure>['_input_in']];

export function createClient<TRouter extends ProceduresByType<any>>() {
  const routerProxy = new Proxy({} as any, {
    get(_, type: string) {
      return new Proxy({} as any, {
        get(_, path: string) {
          return {
            type,
            path,
          };
        },
      });
    },
  }) as any as TRouter;

  function query<
    TProcedure extends ValueOf<TRouter['queries']> & ProcedureCall<any, any>,
  >(path: TProcedure, ...args: inferProcedureArgs<TProcedure>) {}

  return {
    queries: routerProxy.queries as TRouter['queries'],
    mutations: routerProxy.mutations as TRouter['mutations'],
    query,
  };
}
