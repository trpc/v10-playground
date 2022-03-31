import { ProcedureType } from './procedure';
import { MiddlewareMarker, UnsetMarker } from './utils';

interface MiddlewareResultBase<TParams extends Params> {
  /**
   * All middlewares should pass through their `next()`'s output.
   * Requiring this marker makes sure that can't be forgotten at compile-time.
   */
  readonly marker: MiddlewareMarker;
  ctx: TParams['ctx'];
}

interface MiddlewareOKResult<TParams extends Params>
  extends MiddlewareResultBase<TParams> {
  ok: true;
  data: unknown;
  // this could be extended with `input`/`rawInput` later
}
interface MiddlewareErrorResult<TParams extends Params>
  extends MiddlewareResultBase<TParams> {
  ok: false;
  error: Error;
  // we could guarantee it's always of this type
}

export type MiddlewareResult<TParams extends Params> =
  | MiddlewareOKResult<TParams>
  | MiddlewareErrorResult<TParams>;

export interface Params<
  TContext = unknown,
  TInputIn = unknown,
  TInputOut = unknown,
  TOutputIn = unknown,
  TOutputOut = unknown,
> {
  ctx: TContext;
  _output_in: TOutputIn;
  _output_out: TOutputOut;
  _input_in: TInputIn;
  _input_out: TInputOut;
}

export type MiddlewareFunction<
  TParams extends Params,
  TParamsAfter extends Params,
> = (opts: {
  ctx: TParams['ctx'];
  type: ProcedureType;
  path: string;
  input: TParams['_input_out'];
  rawInput: unknown;
  next: {
    (): Promise<MiddlewareResult<TParams>>;
    <$TContext>(opts: { ctx: $TContext }): Promise<
      MiddlewareResult<{
        ctx: $TContext;
        _input_in: TParams['_input_in'];
        _input_out: TParams['_input_out'];
        _output_in: TParams['_output_in'];
        _output_out: TParams['_output_out'];
      }>
    >;
  };
}) => Promise<MiddlewareResult<TParamsAfter>>;

export type inferMiddlewareParams<
  TMiddleware extends MiddlewareFunction<any, any>,
> = TMiddleware extends MiddlewareFunction<any, infer $TParams>
  ? $TParams
  : never;

export function createMiddlewareFactory<TContext>() {
  return function createMiddleware<$TNewParams extends Params>(
    fn: MiddlewareFunction<
      {
        ctx: TContext;
        _input_out: unknown;
        _input_in: unknown;
        _output_in: unknown;
        _output_out: unknown;
      },
      $TNewParams
    >,
  ) {
    return fn;
  };
}
