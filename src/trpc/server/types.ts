import { ProcedureResultError, Procedure } from './procedure';

///////////// inference helpers //////////
export type ExcludeErrorLike<T> = T extends ProcedureResultError<any>
  ? never
  : T;
export type OnlyErrorLike<T> = T extends ProcedureResultError<any> ? T : never;
export interface ClientError<T extends ProcedureResultError<any>> {
  error: T['error'];
}
type OmitErrorResultMarkersFromResult<T> = T extends ProcedureResultError<any>
  ? ClientError<T>
  : T;

export interface ProcedureDefinition<TContext, TInputIn, TInputOut, TResult>
  extends ResolverParams<TContext, TInputIn, TInputOut> {
  result: OmitErrorResultMarkersFromResult<TResult>;
  data: ExcludeErrorLike<TResult>;
  errors: ClientError<OnlyErrorLike<TResult>>;
}

interface ResolverParams<TContext, TInputIn, TInputOut>
  extends InputSchema<TInputIn, TInputOut> {
  ctx: TContext;
}

type inferProcedureParams<TParams> = TParams extends {
  ctx: infer TContext;
}
  ? TParams extends InputSchema<infer TInputIn, infer TInputOut>
    ? ResolverParams<TContext, TInputIn, TInputOut>
    : ResolverParams<TContext, undefined, undefined>
  : never;

export type inferProcedure<TProcedure extends Procedure<any, any, any>> =
  TProcedure extends Procedure<infer _TBaseParams, infer TParams, infer TResult>
    ? TParams extends inferProcedureParams<TParams>
      ? ProcedureDefinition<
          TParams['ctx'],
          TParams['_input_in'],
          TParams['_input_out'],
          TResult
        >
      : never
    : never;

export type inferProcedureArgs<TParams> = TParams extends {
  _input_in: infer TInput;
}
  ? undefined extends TInput
    ? [TInput?]
    : [TInput]
  : [];

export interface InputSchema<TInput, TOutput> {
  /**
   * Input value used by consumer.
   * Value before potential data transform like zod's `transform()`
   * @internal
   */
  _input_in: TInput;
  /**
   * Input value sent to resolver.
   * @internal
   */
  _input_out: TOutput;

  /**
   * Transformed and run-time validate input value
   */
  input: TOutput;
}
