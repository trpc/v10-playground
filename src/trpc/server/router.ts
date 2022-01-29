import { Procedure, ProcedureResult } from './';

export type ProcedureRecord<TContext> = Record<
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
