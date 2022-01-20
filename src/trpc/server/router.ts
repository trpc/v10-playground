import { Procedure, ProcedureResult } from './';

type ProcedureRecordValue<TContext> =
  | Procedure<{ ctx: TContext }, ProcedureResult>
  | ProcedureRecord<TContext>;

type ProcedureRecord<TContext> = Record<string, ProcedureRecordValue<TContext>>;

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
