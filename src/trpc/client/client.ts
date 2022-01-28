import type { ProceduresByType } from '../server';
import { createRouterProxy } from './createRouterProxy';

export function createClient<TRouter extends ProceduresByType<any>>(): {
  query: NonNullable<TRouter['queries']>;
  mutation: NonNullable<TRouter['mutations']>;
} {
  const proxy = createRouterProxy<TRouter>();

  return proxy as any;
}
