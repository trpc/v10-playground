import { MiddlewareFunction, Params } from './middleware';
import { ParserWithInputOutput, Parser, inferParser } from './parser';
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

export interface ProcedureReturnInput<TContext, TInputIn, TInputOut, TOutput> {
  input<$TParser extends Parser>(
    schema: $TParser,
  ): ProcedureReturnInput<
    TContext,
    inferParser<$TParser>['in'],
    inferParser<$TParser>['out'],
    TOutput
  >;
  use<$TParams extends Params>(
    fn: MiddlewareFunction<
      {
        ctx: TContext;
        input: TInputOut;
        _input_in: TInputIn;
      },
      $TParams
    >,
  ): ProcedureReturnInput<
    undefined extends $TParams['ctx'] ? TContext : $TParams['ctx'],
    undefined extends $TParams['_input_in'] ? TInputIn : $TParams['_input_in'],
    undefined extends $TParams['input'] ? TInputOut : $TParams['input'],
    TOutput
  >;
  apply<
    $ProcedureReturnInput extends Partial<
      ProcedureReturnInput<any, any, any, any>
    >,
  >(
    proc: $ProcedureReturnInput,
  ): $ProcedureReturnInput extends Partial<
    ProcedureReturnInput<
      infer $TContext,
      infer $TInputIn,
      infer $TInputOut,
      infer $TOutput
    >
  >
    ? ProcedureReturnInput<
        Overwrite<TContext, $TContext>,
        $TInputIn,
        $TInputOut,
        $TOutput
      >
    : never;
  resolve<$TOutput>(
    resolver: (
      opts: ResolveOptions<TContext, TInputOut>,
    ) => MaybePromise<$TOutput>,
  ): TOutput extends unknown
    ? Procedure<TContext, TInputOut, $TOutput>
    : Procedure<TContext, TInputOut, TOutput>;
}

export function createProcedureFactory<TContext>() {
  return function createProcedure(): ProcedureReturnInput<
    TContext,
    undefined,
    undefined,
    undefined
  > {
    throw new Error('unimplemented');
  };
}
