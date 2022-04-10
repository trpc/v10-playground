import { Procedure } from './procedure';

// FIXME this should properly use TContext
type ProcedureRecord<_TContext> = Record<string, Procedure<any>>;

export interface ProceduresByType<TContext> {
  queries?: ProcedureRecord<TContext>;
  mutations?: ProcedureRecord<TContext>;
}

type ValidateShape<TActualShape, TExpectedShape> =
  TActualShape extends TExpectedShape
    ? Exclude<keyof TActualShape, keyof TExpectedShape> extends never
      ? TActualShape
      : TExpectedShape
    : never;

export function createRouterWithContext<TContext>() {
  return function createRouter<TProcedures extends ProceduresByType<TContext>>(
    procedures: ValidateShape<TProcedures, ProceduresByType<TContext>>,
  ): TProcedures {
    return procedures as any;
  };
}

type mergeRouters<
  TContext,
  A extends ProceduresByType<TContext>,
  B extends ProceduresByType<TContext>,
> = {
  queries: A['queries'] & B['queries'];
  mutations: A['mutations'] & B['mutations'];
};

type mergeRoutersVariadic<Routers extends ProceduresByType<any>[]> =
  Routers extends []
    ? {}
    : Routers extends [infer First, ...infer Rest]
    ? First extends ProceduresByType<any>
      ? Rest extends ProceduresByType<any>[]
        ? mergeRouters<any, First, mergeRoutersVariadic<Rest>>
        : never
      : never
    : never;

export function mergeRouters<TRouters extends ProceduresByType<any>[]>(
  ..._routers: TRouters
): mergeRoutersVariadic<TRouters> {
  throw new Error('Unimplemnted');
}
