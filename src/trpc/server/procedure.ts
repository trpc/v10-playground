import { MiddlewareFunction, Params } from './middleware';
import { Parser, inferParser } from './parser';
import {
  DefaultValue as FallbackValue,
  Overwrite,
  ProcedureMarker,
  UnsetMarker,
} from './utils';

// type ProcedureBuilder
type MaybePromise<T> = T | Promise<T>;
interface ResolveOptions<TContext, TInput> {
  ctx: TContext;
  input: TInput;
}
export type ProcedureType = 'query' | 'mutation' | 'subscription';

export type Procedure<_TContext, TInput, TOutput> = (TInput extends UnsetMarker
  ? (input?: undefined) => Promise<TOutput>
  : TInput extends undefined
  ? (input?: TInput) => Promise<TOutput>
  : (_input_out: TInput) => Promise<TOutput>) &
  ProcedureMarker;

type CreateProcedureReturnInput<
  TPrev extends Params,
  TNext extends Params,
> = ProcedureBuilder<{
  ctx: Overwrite<TPrev['ctx'], TNext['ctx']>;
  _input_out: FallbackValue<TNext['_input_out'], TPrev['_input_out']>;
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
    _input_out: inferParser<$TParser>['out'];
  }>;
  output<$TParser extends Parser>(
    schema: $TParser,
  ): ProcedureBuilder<{
    ctx: TParams['ctx'];
    _input_in: TParams['_input_in'];
    _input_out: TParams['_input_out'];
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
      opts: ResolveOptions<TParams['ctx'], TParams['_input_out']>,
    ) => MaybePromise<FallbackValue<TParams['_output_in'], $TOutput>>,
  ): Procedure<
    TParams['ctx'],
    TParams['_input_in'],
    FallbackValue<TParams['_output_in'], $TOutput>
  >;
}

export function createBuilder<TContext>(): ProcedureBuilder<{
  ctx: TContext;
  _input_out: UnsetMarker;
  _input_in: UnsetMarker;
  _output_in: UnsetMarker;
  _output_out: UnsetMarker;
}> {
  throw new Error('unimplemented');
}
