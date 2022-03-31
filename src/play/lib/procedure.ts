import { MiddlewareFunction, Params } from './middleware';
import { Parser, inferParser } from './parser';
import { Overwrite } from './utils';

// type ProcedureBuilder
type MaybePromise<T> = T | Promise<T>;
interface ResolveOptions<TContext, TInput> {
  ctx: TContext;
  input: TInput;
}
export type ProcedureType = 'query' | 'mutation' | 'subscription';

export type Procedure<_TContext, TInput, TOutput> = TInput extends undefined
  ? (input?: TInput) => Promise<TOutput>
  : (input: TInput) => Promise<TOutput>;

type CreateProcedureReturnInput<
  TPrev extends Params,
  TNext extends Params,
> = ProcedureReturnInput<{
  ctx: Overwrite<TPrev['ctx'], TNext['ctx']>;
  input: undefined extends TNext['input'] ? TPrev['input'] : TNext['input'];
  _input_in: undefined extends TNext['_input_in']
    ? TPrev['_input_in']
    : TNext['_input_in'];
}>;

export interface ProcedureReturnInput<TParams extends Params> {
  input<$TParser extends Parser>(
    schema: $TParser,
  ): ProcedureReturnInput<{
    ctx: TParams['ctx'];
    _input_in: inferParser<$TParser>['in'];
    input: inferParser<$TParser>['out'];
  }>;
  use<$TParams extends Params>(
    fn: MiddlewareFunction<TParams, $TParams>,
  ): CreateProcedureReturnInput<TParams, $TParams>;
  apply<$ProcedureReturnInput extends Partial<ProcedureReturnInput<any>>>(
    proc: $ProcedureReturnInput,
  ): $ProcedureReturnInput extends Partial<ProcedureReturnInput<infer $TParams>>
    ? CreateProcedureReturnInput<TParams, $TParams>
    : never;
  resolve<$TOutput>(
    resolver: (
      opts: ResolveOptions<TParams['ctx'], TParams['input']>,
    ) => MaybePromise<$TOutput>,
  ): Procedure<TParams['ctx'], TParams['input'], $TOutput>;
}

export function createProcedureFactory<TContext>() {
  return function createProcedure(): ProcedureReturnInput<{
    ctx: TContext;
    input: undefined;
    _input_in: undefined;
  }> {
    throw new Error('unimplemented');
  };
}
