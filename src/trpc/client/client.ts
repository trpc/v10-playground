import type {
  inferProcedure,
  ProcedureCall,
  ProceduresByType,
} from '../server';

type ValueOf<T> = T[keyof T];

type inferProcedureArgs<TProcedure extends ProcedureCall<any, any>> =
  undefined extends inferProcedure<TProcedure>['_input_in']
    ? [inferProcedure<TProcedure>['_input_in']?]
    : [inferProcedure<TProcedure>['_input_in']];

export function createClient<TRouter extends ProceduresByType<any>>() {
  function query<
    TPath extends keyof TRouter['queries'] & string,
    TProcedure extends TRouter['queries'][TPath] & ProcedureCall<any, any>,
  >(
    path: TPath,
    ...args: inferProcedureArgs<TProcedure>
  ): Promise<inferProcedure<TProcedure>['result']>;
  function query<
    TProcedure extends ValueOf<TRouter['queries']> & ProcedureCall<any, any>,
  >(
    path: TProcedure,
    ...args: inferProcedureArgs<TProcedure>
  ): Promise<inferProcedure<TProcedure>['result']>;
  function query(...args: any[]): any {
    throw new Error('Unimplemented');
  }

  return {
    query,
  };
}
