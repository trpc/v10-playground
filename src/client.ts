import type { appRouter } from './server';
import { createClient } from './@trpc/client';

const client = createClient<typeof appRouter>();

async function main() {
  // you can CMD+click `postAll` / `postById` here
  const greeting = await client.query.postList();
  const byId = await client.query.postById({
    input: { id: '1' },
  });

  console.log('data', { greeting, byId });
}

main();
