import type { appRouter } from './server';
import { createClient } from './trpc/client';

const client = createClient<typeof appRouter>();

const { queries } = client;

// you can CMD+click `greeting` below to get to the definition
client.query(queries.greeting, { hello: 'world' });
// you can CMD+click `post.all` below to get to the definition
client.query(queries['post.all']);
