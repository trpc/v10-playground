import type { appRouter } from './server/routers/_app';
import { createClient } from '../src/trpc/client';
import { createRouterProxy } from '../src/trpc/client/createRouterProxy';

const client = createClient<typeof appRouter>();
const { queries } = createRouterProxy<typeof appRouter>();

async function main() {
  const q1 = await client.query(queries.r99q5, { hello: 'world' });
  // const q2 = await client.query('r99q5', { hello: 'world' });

  if ('data' in q1) {
    console.log('data.input', q1.data.input);
  }
}

main();
