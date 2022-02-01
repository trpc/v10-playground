import { createClient } from '../src/trpc/client';
import type { appRouter } from './server/routers/_app';

const client = createClient<typeof appRouter>();

async function main() {
  const result = await client.query.r0q0({ hello: 'world' });

  if (result.ok) {
    console.log(result.data);
  } else {
    console.log(result.error.code);
  }
}

main();
