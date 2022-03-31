import { ProcedureType } from './procedure';

export const middlewareMarker = Symbol('middlewareMarker');
interface MiddlewareResultBase<TParams extends Params> {
  /**
   * All middlewares should pass through their `next()`'s output.
   * Requiring this marker makes sure that can't be forgotten at compile-time.
   */
  readonly marker: typeof middlewareMarker;
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
> {
  ctx: TContext;
  _input_in: TInputIn;
  input: TInputOut;
}

export type MiddlewareFunction<
  TParams extends Params,
  TParamsAfter extends Params,
> = (opts: {
  ctx: TParams['ctx'];
  type: ProcedureType;
  path: string;
  input: TParams['input'];
  rawInput: unknown;
  next: {
    (): Promise<MiddlewareResult<TParams>>;
    <$TContext>(opts: { ctx: $TContext }): Promise<
      MiddlewareResult<{
        ctx: $TContext;
        input: TParams['input'];
        _input_in: TParams['input'];
      }>
    >;
    <$TInputIn, $InputOut>(opts: {
      _input_in: $TInputIn;
      input: $InputOut;
    }): Promise<
      MiddlewareResult<{
        _input_in: $TInputIn;
        input: $InputOut;
        ctx: TParams['ctx'];
      }>
    >;
    <$TContext, $TInputIn, $TInputOut>(opts: {
      _input_in: $TInputIn;
      input: $TInputOut;
      ctx: $TContext;
    }): Promise<
      MiddlewareResult<{
        _input_in: $TInputIn;
        ctx: $TContext;
        input: $TInputOut;
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
      { ctx: TContext; input: unknown; _input_in: unknown },
      $TNewParams
    >,
  ) {
    return fn;
  };
}
