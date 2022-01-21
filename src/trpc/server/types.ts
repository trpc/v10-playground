import { ProcedureResultError } from './';
import { Procedure } from './procedure';

///////////// inference helpers //////////
export type ExcludeErrorLike<T> = T extends ProcedureResultError ? never : T;
export type OnlyErrorLike<T> = T extends ProcedureResultError ? T : never;
export interface ProcedureDefinition<TContext, TInputIn, TInputOut, TResult>
  extends InputSchema<TInputIn, TInputOut> {
  ctx: TContext;
  result: TResult;
  data: ExcludeErrorLike<TResult>;
  errors: OnlyErrorLike<TResult>;
}
export type inferParamsInput<TParams> = TParams extends InputSchema<
  infer TBefore,
  infer TAfter
>
  ? InputSchema<TBefore, TAfter>
  : InputSchema<undefined, undefined>;
export type inferProcedureParams<TProcedure extends Procedure<any, any, any>> =
  TProcedure extends Procedure<any, infer TParams, any> ? TParams : never;
export type inferProcedureResult<TProcedure extends Procedure<any, any, any>> =
  TProcedure extends Procedure<any, any, infer TResult> ? TResult : never;
export type inferProcedure<TProcedure> = TProcedure extends Procedure<
  any,
  any,
  any
>
  ? ProcedureDefinition<
      inferProcedureParams<TProcedure>['ctx'],
      inferParamsInput<inferProcedureParams<TProcedure>>['_input_in'],
      inferParamsInput<inferProcedureParams<TProcedure>>['_input_out'],
      inferProcedureResult<TProcedure>
    >
  : never;
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
