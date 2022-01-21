import { Procedure } from './procedure';

type ProcedureRecord<TContext> = Record<
  string,
  Procedure<{ ctx: TContext }, { ctx: TContext }, any>
>;

export interface ProceduresByType<TContext> {
  queries?: ProcedureRecord<TContext>;
  mutations?: ProcedureRecord<TContext>;
}

export function createRouterWithContext<TContext>() {
  return function createRouter<TProcedures extends ProceduresByType<TContext>>(
    procedures: TProcedures,
  ): TProcedures {
    return procedures;
  };
}
