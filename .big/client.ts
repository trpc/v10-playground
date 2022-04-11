import { createClient } from '../src/@trpc/client';
import type { appRouter } from './server/routers/_app';

const client = createClient<typeof appRouter>();

async function main() {
  const result = await client.query.r0q0({ input: { hello: 'world' } });

  console.log(result);
}

main();
