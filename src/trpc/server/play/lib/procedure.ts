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
  input<$TInputIn, $TInputOut>(
    schema: ParserWithInputOutput<$TInputIn, $TInputOut>,
  ): Omit<
    ProcedureReturnInput<TContext, $TInputIn, $TInputOut, TOutput>,
    'input'
  >;
  input<$TParser extends Parser>(
    schema: $TParser,
  ): Omit<
    ProcedureReturnInput<
      TContext,
      inferParser<$TParser>['in'],
      inferParser<$TParser>['out'],
      TOutput
    >,
    'input'
  >;
  use<$TParams extends Params>(
    fn: MiddlewareFunction<
      {
        ctx: TContext;
        input: TInputIn;
        _input_in: TInputOut;
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
  ): $ProcedureReturnInput extends ProcedureReturnInput<
    infer $TContext,
    infer $TInputIn,
    infer $TInputOut,
    infer $TOutput
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
    ? Procedure<TContext, TInputIn, $TOutput>
    : Procedure<TContext, TInputIn, TOutput>;
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
