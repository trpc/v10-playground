import { Procedure } from './';

type ProcedureRecord<TContext> = Record<
  string,
  Procedure<{ ctx: TContext }, any>
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

// FIXME delete these comments
type TestContext = {
  ok: true;
};
const routerA = createRouterWithContext<TestContext>()({
  queries: {
    a: async () => ({ data: 'a' as const }),
  },
});

const routerB = createRouterWithContext<TestContext>()({
  queries: {
    b: async ({ ctx }) => ({ data: 'b' as const, ctx }),
  },
});
const routerMerged = mergeRouters(routerA, routerB);

routerMerged.queries.b;
