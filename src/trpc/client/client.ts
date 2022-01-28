import type { ProceduresByType } from '../server';
import { createRouterProxy } from './createRouterProxy';

export function createClient<TRouter extends ProceduresByType<any>>() {
  const proxy = createRouterProxy<TRouter>();

  const query = proxy.queries as TRouter['queries'];
  const mutation = proxy.mutations as TRouter['mutations'];

  return {
    query,
    mutation,
  };
}
