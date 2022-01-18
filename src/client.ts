import type { appRouter } from './server';
import { createClient } from './trpc/client';

const client = createClient<typeof appRouter>();

const { queries } = client;

async function main() {
  // you can CMD+click `greeting` below to get to the definition
  const greeting = await client.query(queries.greeting, { hello: 'world' });
  // you can CMD+click `post.all` below to get to the definition
  const posts = await client.query(queries['post.all']);
}

main();
