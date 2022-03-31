import { MiddlewareFunction, Params } from './middleware';
import { Parser, inferParser } from './parser';
import { DefaultValue as FallbackValue, Overwrite, UnsetMarker } from './utils';

// type ProcedureBuilder
type MaybePromise<T> = T | Promise<T>;
interface ResolveOptions<TContext, TInput> {
  ctx: TContext;
  input: TInput;
}
export type ProcedureType = 'query' | 'mutation' | 'subscription';

export type Procedure<TInput, TOutput> = TInput extends UnsetMarker
  ? (input?: undefined) => Promise<TOutput>
  : TInput extends undefined
  ? (input?: TInput) => Promise<TOutput>
  : (input: TInput) => Promise<TOutput>;

type CreateProcedureReturnInput<
  TPrev extends Params,
  TNext extends Params,
> = ProcedureBuilder<{
  ctx: Overwrite<TPrev['ctx'], TNext['ctx']>;
  input: FallbackValue<TNext['input'], TPrev['input']>;
  _input_in: FallbackValue<TNext['_input_in'], TPrev['_input_in']>;
  _output_in: FallbackValue<TNext['_output_in'], TPrev['_output_in']>;
  _output_out: FallbackValue<TNext['_output_out'], TPrev['_output_out']>;
}>;

export interface ProcedureBuilder<TParams extends Params> {
  input<$TParser extends Parser>(
    schema: $TParser,
  ): ProcedureBuilder<{
    ctx: TParams['ctx'];
    _output_in: TParams['_output_in'];
    _output_out: TParams['_output_out'];
    _input_in: inferParser<$TParser>['in'];
    input: inferParser<$TParser>['out'];
  }>;
  output<$TParser extends Parser>(
    schema: $TParser,
  ): ProcedureBuilder<{
    ctx: TParams['ctx'];
    _input_in: TParams['_input_in'];
    input: TParams['input'];
    _output_in: inferParser<$TParser>['in'];
    _output_out: inferParser<$TParser>['out'];
  }>;
  use<$TParams extends Params>(
    fn: MiddlewareFunction<TParams, $TParams>,
  ): CreateProcedureReturnInput<TParams, $TParams>;
  apply<$ProcedureReturnInput extends Partial<ProcedureBuilder<any>>>(
    proc: $ProcedureReturnInput,
  ): $ProcedureReturnInput extends Partial<ProcedureBuilder<infer $TParams>>
    ? CreateProcedureReturnInput<TParams, $TParams>
    : never;
  resolve<$TOutput>(
    resolver: (
      opts: ResolveOptions<TParams['ctx'], TParams['input']>,
    ) => MaybePromise<FallbackValue<TParams['_output_in'], $TOutput>>,
  ): Procedure<
    TParams['_input_in'],
    FallbackValue<TParams['_output_in'], $TOutput>
  >;
}

export function createProcedureFactory<TContext>() {
  return function createProcedure(): ProcedureBuilder<{
    ctx: TContext;
    input: UnsetMarker;
    _input_in: UnsetMarker;
    _output_in: UnsetMarker;
    _output_out: UnsetMarker;
  }> {
    throw new Error('unimplemented');
  };
}
