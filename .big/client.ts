import type { appRouter } from './server/routers/_app';
import { createClient } from '../src/trpc/client';
import { createRouterProxy } from '../src/trpc/client/createRouterProxy';

const client = createClient<typeof appRouter>();
const { queries } = createRouterProxy<typeof appRouter>();

async function main() {
  const q1 = await client.query.r29q5({ hello: 'world' });

  if (q1.ok) {
    console.log(q1.data);
  } else {
    console.log(q1.error);
  }
}

main();
