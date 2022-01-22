import type { appRouter } from './server/routers/_app';
import { createClient } from '../src/trpc/client';
import { createRouterProxy } from '../src/trpc/client/createRouterProxy';

const client = createClient<typeof appRouter>();
const { queries } = createRouterProxy<typeof appRouter>();

async function main() {
  const greeting = await client.query(queries.r42q5, { hello: 'world' });
  const posts = await client.query('r42q5', { hello: 'world' });

  console.log({ greeting, posts });
}

main();
