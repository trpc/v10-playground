import { MiddlewareFunction, Params } from './middleware';
import { ParserWithInputOutput, Parser, inferParser } from './parser';

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

export interface ProcedureReturnInput<TContext, TInput, TParsedInput, TOutput> {
  input<$TInput, $TParsedInput>(
    schema: ParserWithInputOutput<$TInput, $TParsedInput>,
  ): Omit<
    ProcedureReturnInput<TContext, $TInput, $TParsedInput, TOutput>,
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

  // middleware<$MiddlewareFn extends MiddlewareFunction<TContext>>()
  use<$TParams extends Params>(
    fn: MiddlewareFunction<
      {
        ctx: TContext;
        input: TInput;
      },
      $TParams
    >,
  ): ProcedureReturnInput<
    $TParams['ctx'],
    $TParams['input'],
    TParsedInput,
    TOutput
  >;
  resolve<$TOutput>(
    resolver: (
      opts: ResolveOptions<TContext, TParsedInput>,
    ) => MaybePromise<$TOutput>,
  ): TOutput extends unknown
    ? Procedure<TContext, TInput, $TOutput>
    : Procedure<TContext, TInput, TOutput>;
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
