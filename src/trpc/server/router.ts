import { Procedure, ProcedureResult } from './';

type ProcedureRecord<TContext> = Record<
  string,
  Procedure<{ ctx: TContext }, ProcedureResult>
>;

export interface ProceduresByType<TContext> {
  queries?: ProcedureRecord<TContext>;
  mutations?: ProcedureRecord<TContext>;
}

type ValidateShape<TActualShape, TExpectedShape> =
  TActualShape extends TExpectedShape
    ? Exclude<keyof TActualShape, keyof TExpectedShape> extends never
      ? TActualShape
      : TExpectedShape
    : never;

export function createRouterWithContext<TContext>() {
  return function createRouter<TProcedures extends ProceduresByType<TContext>>(
    procedures: ValidateShape<TProcedures, ProceduresByType<TContext>>,
  ): TProcedures {
    return procedures as any;
  };
}
type PrefixedRouters<TContext> = Record<string, ProceduresByType<TContext>>;

type PrefixRouters<
  T extends PrefixedRouters<any>,
  TDelimiter extends string = '',
> = {
  queries: {
    [TPath in keyof T as `${TPath &
      string}${TDelimiter}${keyof T[TPath]['queries'] &
      string}`]: T[TPath]['queries'];
  };
  mutations: {
    [TPath in keyof T as `${TPath &
      string}${TDelimiter}${keyof T[TPath]['mutations'] &
      string}`]: T[TPath]['mutations'];
  };
};
export function mergeRouters<
  T extends PrefixedRouters<TContext>,
  TContext,
  TDelimiter extends string = '',
>(_routers: T, _delimiter?: TDelimiter): PrefixRouters<T, TDelimiter> {
  throw new Error('Unimplemente');
}
