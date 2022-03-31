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
> = ProcedureReturnInput<
  undefined extends TNext['ctx']
    ? TPrev['ctx']
    : Overwrite<TPrev['ctx'], TNext['ctx']>,
  undefined extends TNext['_input_in']
    ? TPrev['_input_in']
    : TNext['_input_in'],
  undefined extends TNext['input'] ? TPrev['input'] : TNext['input'],
  any
>;

export interface ProcedureReturnInput<TContext, TInputIn, TInputOut, TOutput> {
  input<$TParser extends Parser>(
    schema: $TParser,
  ): CreateProcedureReturnInput<
    {
      _input_in: NonNullable<TInputIn>;
      input: NonNullable<TInputOut>;
      ctx: TContext;
    },
    {
      _input_in: inferParser<$TParser>['in'];
      input: inferParser<$TParser>['out'];
      ctx: TContext;
    }
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
  ): CreateProcedureReturnInput<
    {
      _input_in: TInputIn;
      input: TInputOut;
      ctx: TContext;
    },
    $TParams
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
      infer _$TOutput
    >
  >
    ? CreateProcedureReturnInput<
        {
          _input_in: TInputIn;
          input: TInputOut;
          ctx: TContext;
        },
        {
          _input_in: $TInputIn;
          input: $TInputOut;
          ctx: $TContext;
        }
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
