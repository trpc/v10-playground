import { ProcedureResultError, Procedure, ProcedureWithMeta } from './';

///////////// inference helpers //////////
type ExcludeErrorLike<T> = T extends ProcedureResultError<any> ? never : T;
type OnlyErrorLike<T> = T extends ProcedureResultError<any> ? T : never;
export interface ProcedureDefinition<TContext, TInputIn, TInputOut, TResult>
  extends InputSchema<TInputIn, TInputOut> {
  ctx: TContext;
  result: TResult;
  data: ExcludeErrorLike<TResult>;
  errors: OnlyErrorLike<TResult>;
}
type inferParamsInput<TParams> = TParams extends InputSchema<
  infer TBefore,
  infer TAfter
>
  ? InputSchema<TBefore, TAfter>
  : InputSchema<undefined, undefined>;
type inferProcedureParams<TProcedure extends Procedure<any, any>> =
  TProcedure extends ProcedureWithMeta<any, infer TParams, any>
    ? TParams
    : TProcedure extends Procedure<any, infer TParams>
    ? TParams
    : never;
type inferProcedureResult<TProcedure extends Procedure<any, any>> =
  TProcedure extends Procedure<any, infer TResult> ? TResult : never;
export type inferProcedure<TProcedure extends Procedure<any, any>> =
  ProcedureDefinition<
    inferProcedureParams<TProcedure>['ctx'],
    inferParamsInput<inferProcedureParams<TProcedure>>['_input_in'],
    inferParamsInput<inferProcedureParams<TProcedure>>['_input_out'],
    inferProcedureResult<TProcedure>
  >;
///////////// reusable middlewares /////////
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
