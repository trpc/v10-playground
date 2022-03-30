import { ProcedureType } from './procedure';

export const middlewareMarker = Symbol('middlewareMarker');
interface MiddlewareResultBase<TParams extends Params> {
  /**
   * All middlewares should pass through their `next()`'s output.
   * Requiring this marker makes sure that can't be forgotten at compile-time.
   */
  readonly marker: typeof middlewareMarker;
  ctx: TParams['ctx'];
  /**
   * @deprecated remove me
   */
  input: TParams['input'];
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

export interface Params<TContext = unknown, TInput = unknown> {
  ctx: TContext;
  input: TInput;
}

export type MiddlewareFunction<
  TParams extends Params,
  TParamsAfter extends Params,
> = (opts: {
  ctx: TParams['ctx'];
  type: ProcedureType;
  path: string;
  rawInput: unknown;
  input: TParams['input'];
  next: {
    (): Promise<MiddlewareResult<TParams>>;
    <$TContext>(opts: { ctx: $TContext }): Promise<
      MiddlewareResult<{ ctx: $TContext; input: TParams['input'] }>
    >;
    <$Input>(opts: { input: $Input }): Promise<
      MiddlewareResult<{ input: $Input; ctx: TParams['ctx'] }>
    >;
    <$TContext, $TInput>(opts: { input: $TInput; ctx: $TContext }): Promise<
      MiddlewareResult<{
        ctx: $TContext;
        input: $TInput;
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
    fn: MiddlewareFunction<{ ctx: TContext; input: unknown }, $TNewParams>,
  ) {
    return fn;
  };
}
