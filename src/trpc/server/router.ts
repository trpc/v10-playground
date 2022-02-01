import { Procedure, ProcedureResult } from './';

type ProcedureRecord<TContext> = Record<
  string,
  Procedure<{ ctx: TContext }, ProcedureResult>
>;

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
  A extends ProceduresByType<any>,
  B extends ProceduresByType<any>,
> = {
  queries: A['queries'] & B['queries'];
  mutations: A['mutations'] & B['mutations'];
};

type mergeRoutersVariadic<Routers extends ProceduresByType<any>[]> =
  Routers extends []
    ? ProceduresByType<any>
    : Routers extends [infer First, ...infer Rest]
    ? First extends ProceduresByType<any>
      ? Rest extends ProceduresByType<any>[]
        ? mergeRouters<First, mergeRoutersVariadic<Rest>>
        : never
      : never
    : never;

export function mergeRouters<TRouters extends ProceduresByType<any>[]>(
  ..._routers: TRouters
): mergeRoutersVariadic<TRouters> {
  throw new Error('Unimplemnted');
}
