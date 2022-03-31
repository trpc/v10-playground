import type { appRouter } from './server';
import { createClient } from './lib/client';

const client = createClient<typeof appRouter>();

async function main() {
  // you can CMD+click `postAll` / `postById` here
  const greeting = await client.query.postList();
  const byId = await client.query.postById({ id: '1' });

  console.log('data', byId.data);
}

main();
