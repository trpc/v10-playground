import type { inferProcedure, Procedure, ProceduresByType } from '../server';

type ValueOf<T> = T[keyof T];

type inferProcedureArgs<TProcedure extends Procedure<any, any>> =
  undefined extends inferProcedure<TProcedure>['_input_in']
    ? [inferProcedure<TProcedure>['_input_in']?]
    : [inferProcedure<TProcedure>['_input_in']];

export function createClient<TRouter extends ProceduresByType<any>>() {
  function query<
    TPath extends keyof TRouter['queries'] & string,
    TProcedure extends TRouter['queries'][TPath] & Procedure<any, any>,
  >(
    path: TPath,
    ...args: inferProcedureArgs<TProcedure>
  ): Promise<inferProcedure<TProcedure>['result']>;
  function query<
    TProcedure extends ValueOf<TRouter['queries']> & Procedure<any, any>,
  >(
    path: TProcedure,
    ...args: inferProcedureArgs<TProcedure>
  ): Promise<inferProcedure<TProcedure>['result']>;
  function query(...args: any[]): any {
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
  function mutation(...args: any[]): any {
    throw new Error('Unimplemented');
  }

  return {
    query,
    mutation,
  };
}
