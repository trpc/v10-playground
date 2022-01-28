import type { appRouter } from './server';
import { createClient } from './trpc/client';

const client = createClient<typeof appRouter>();

async function main() {
  // you can CMD+click `postAll` / `postById` here
  const greeting = await client.queries.postList();
  const byId = await client.queries.postById({ id: '1' });

  if (byId.ok) {
    console.log('data', byId.data);
  } else {
    console.log(byId.error.code);
  }

  console.log({ greeting, byId });
}

main();
