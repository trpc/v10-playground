import { Procedure } from './procedure';

// FIXME this should properly use TContext
type ProcedureRecord<_TContext> = Record<string, Procedure<any>>;

export interface Router<TContext> {
  queries?: ProcedureRecord<TContext>;
  mutations?: ProcedureRecord<TContext>;
  subscriptions?: ProcedureRecord<TContext>;
}

type ValidateShape<TActualShape, TExpectedShape> =
  TActualShape extends TExpectedShape
    ? Exclude<keyof TActualShape, keyof TExpectedShape> extends never
      ? TActualShape
      : TExpectedShape
    : never;

export function createRouterWithContext<TContext>() {
  return function createRouter<TProcedures extends Router<TContext>>(
    procedures: ValidateShape<TProcedures, Router<TContext>>,
  ): TProcedures {
    return procedures as any;
  };
}

type EnsureRecord<T> = undefined extends T ? {} : T;

type mergeRouters<
  TContext,
  A extends Router<TContext>,
  B extends Router<TContext>,
> = {
  queries: EnsureRecord<A['queries']> & EnsureRecord<B['queries']>;
  mutations: EnsureRecord<A['mutations']> & EnsureRecord<B['mutations']>;
  subscriptions: EnsureRecord<A['subscriptions']> &
    EnsureRecord<B['subscriptions']>;
};

type mergeRoutersVariadic<Routers extends Router<any>[]> = Routers extends []
  ? {}
  : Routers extends [infer First, ...infer Rest]
  ? First extends Router<any>
    ? Rest extends Router<any>[]
      ? mergeRouters<any, First, mergeRoutersVariadic<Rest>>
      : never
    : never
  : never;

export function mergeRouters<TRouters extends Router<any>[]>(
  ..._routers: TRouters
): mergeRoutersVariadic<TRouters> {
  throw new Error('Unimplemnted');
}
