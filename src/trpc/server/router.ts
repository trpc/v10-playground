import { Procedure, ProcedureResult } from './';

type ProcedureRecord<TContext> = Record<
  string,
  Procedure<{ ctx: TContext }, ProcedureResult>
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
