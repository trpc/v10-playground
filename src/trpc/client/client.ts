import type {
  inferProcedure,
  Procedure,
  ProcedureRecord,
  ProceduresByType,
} from '../server';

type ValueOf<T> = T[keyof T];

type inferProcedureArgs<TProcedure extends Procedure<any, any>> =
  undefined extends inferProcedure<TProcedure>['_input_in']
    ? [inferProcedure<TProcedure>['_input_in']?]
    : [inferProcedure<TProcedure>['_input_in']];

type ExpectProcedure<T> = T extends Procedure<any, any> ? T : never;
export function createClient<TRouter extends ProceduresByType<any>>() {
  function query<TPath extends keyof TRouter['queries'] & string>(
    path: TPath,
    ...args: inferProcedureArgs<ExpectProcedure<TRouter['queries'][TPath]>>
  ): Promise<
    inferProcedure<ExpectProcedure<TRouter['queries'][TPath]>>['result']
  >;
  function query<
    TProcedure extends ValueOf<TRouter['queries']> & Procedure<any, any>,
  >(
    path: TProcedure,
    ...args: inferProcedureArgs<TProcedure>
  ): Promise<inferProcedure<TProcedure>['result']>;
  function query(..._args: any[]): any {
    throw new Error('Unimplemented');
  }
  function mutation<
    TPath extends keyof TRouter['mutations'] & string,
    TProcedure extends TRouter['mutations'][TPath] & Procedure<any, any>,
  >(
    path: TPath,
    ...args: inferProcedureArgs<TProcedure>
  ): Promise<inferProcedure<TProcedure>['result']>;
  function mutation<
    TProcedure extends ValueOf<TRouter['mutations']> & Procedure<any, any>,
  >(
    path: TProcedure,
    ...args: inferProcedureArgs<TProcedure>
  ): Promise<inferProcedure<TProcedure>['result']>;
  function mutation(..._args: any[]): any {
    throw new Error('Unimplemented');
  }

  return {
    query,
    mutation,
  };
}

type noUndefined<T> = T extends undefined ? never : T;
type unionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;
type procToHook<
  TProcs extends ProcedureRecord<any>,
  Key extends keyof TProcs,
> = (
  ...args: inferProcedureArgs<ExpectProcedure<TProcs[Key]>>
) => Promise<inferProcedure<ExpectProcedure<TProcs[Key]>>['result']>;
type betterRoute<
  Key extends string,
  FullKey extends string,
  Procs extends ProcedureRecord<any>,
> = Key extends `${infer A}.${infer B}`
  ? { [k in A]: betterRoute<B, FullKey, Procs> }
  : { [k in Key]: procToHook<Procs, FullKey> };
type proxyClient<TProcs extends ProcedureRecord<any>> = unionToIntersection<
  keyof TProcs extends string
    ? betterRoute<keyof TProcs, keyof TProcs, TProcs>
    : unknown
>;
export function createProxyClient<
  TRouter extends ProceduresByType<any>,
>(): proxyClient<noUndefined<TRouter['queries']>> {
  return 'asdf' as any;
}

type flatClient<TProcs extends ProcedureRecord<any>> = {
  [k in keyof TProcs]: procToHook<TProcs, k>;
};
export function createFlatClient<
  TRouter extends ProceduresByType<any>,
>(): flatClient<noUndefined<TRouter['queries']>> {
  return 'asdf' as any;
}
