import { ProcedureCall, ProcedureResult } from "./core";

type ProcedureRecord<TContext> = Record<
  string,
  ProcedureCall<{ ctx: TContext }, ProcedureResult>
>;

export interface ProceduresByType<TContext> {
  queries?: ProcedureRecord<TContext>;
  mutations?: ProcedureRecord<TContext>;
}

export function createRouterWithContext<TContext>() {
  return function createRouter<TProcedures extends ProceduresByType<TContext>>(
    procedures: TProcedures
  ): TProcedures {
    return procedures;
  };
}

export type ProcedureInputParserZodEsque<TInput, TParsedInput> = {
  _input: TInput;
  _output: TParsedInput;
};
