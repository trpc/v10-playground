import { ProcedureResultError, ProcedureCall, ProcedureCallWithMeta } from './';

///////////// inference helpers //////////
type ExcludeErrorLike<T> = T extends ProcedureResultError ? never : T;
type OnlyErrorLike<T> = T extends ProcedureResultError ? T : never;
interface ProcedureDefinition<TContext, TInputIn, TInputOut, TResult>
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
type inferProcedureParams<TProcedure extends ProcedureCall<any, any>> =
  TProcedure extends ProcedureCallWithMeta<any, infer TParams, any>
    ? TParams
    : TProcedure extends ProcedureCall<any, infer TParams>
    ? TParams
    : never;
type inferProcedureResult<TProcedure extends ProcedureCall<any, any>> =
  TProcedure extends ProcedureCall<any, infer TResult> ? TResult : never;
export type inferProcedure<TProcedure extends ProcedureCall<any, any>> =
  ProcedureDefinition<
    inferProcedureParams<TProcedure>['ctx'],
    inferParamsInput<inferProcedureParams<TProcedure>>['_input_in'],
    inferParamsInput<inferProcedureParams<TProcedure>>['_input_out'],
    inferProcedureResult<TProcedure>
  >;
///////////// reusable middlewares /////////
export interface InputSchema<TInput, TOutput> {
  /**
   * Value before potential data transform like zod's `transform()`
   * @internal
   */
  _input_in: TInput;
  /**
   * Value after potential data transform
   * @internal
   */
  _input_out: TOutput;

  /**
   * Transformed and run-time validate input value
   */
  input: TOutput;
}
