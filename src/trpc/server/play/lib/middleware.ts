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

interface MiddlewareOKResult<TParams> extends MiddlewareResultBase<TParams> {
  ok: true;
  data: unknown;
  // this could be extended with `input`/`rawInput` later
}
interface MiddlewareErrorResult<TParams> extends MiddlewareResultBase<TParams> {
  ok: false;
  error: Error;
  // we could guarantee it's always of this type
}

export type MiddlewareResult<TParams extends Params> =
  | MiddlewareOKResult<TParams>
  | MiddlewareErrorResult<TParams>;

export interface Params {
  ctx?: unknown;
  input?: unknown;
}
export interface MiddlewareOptions<TParams extends Params> {
  ctx: TParams['ctx'];
  type: ProcedureType;
  path: string;
  rawInput: unknown;
  next: {
    (): Promise<MiddlewareResult<TParams>>;
    <$TParams extends Params>(opts: $TParams): Promise<
      MiddlewareResult<$TParams>
    >;
  };
}

export type MiddlewareFunction<
  TParams extends Params,
  TParamsAfter extends Params,
> = (opts: {
  ctx: TParams['ctx'];
  type: ProcedureType;
  path: string;
  rawInput: unknown;
  next: {
    (): Promise<MiddlewareResult<TParams>>;
    <$TParams>(opts: $TParams): Promise<MiddlewareResult<$TParams>>;
  };
}) => Promise<MiddlewareResult<TParamsAfter>>;

export type inferMiddlewareParams<
  TMiddleware extends MiddlewareFunction<any, any>,
> = TMiddleware extends MiddlewareFunction<any, infer $TParams>
  ? $TParams
  : never;

export function createMiddlewareFactory<TContext>() {
  return function createMiddleware<$TNewParams extends Params>(
    fn: MiddlewareFunction<{ ctx: TContext }, $TNewParams>,
  ) {
    return fn;
  };
}
