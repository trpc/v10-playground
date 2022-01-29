import type { appRouter } from './server';
import {
  createClient,
  createProxyClient,
  createFlatClient,
} from './trpc/client';
import { createRouterProxy } from './trpc/client/createRouterProxy';

const client = createClient<typeof appRouter>();
const proxyClient = createProxyClient<typeof appRouter>();
const flatClient = createFlatClient<typeof appRouter>();

proxyClient.post.some();

const { queries } = createRouterProxy<typeof appRouter>();

async function main() {
  {
    // you can CMD+click `greeting` below to get to the definition
    const greeting = await client.query(queries.greeting, { hello: 'world' });
    // you can CMD+click `post.all` below to get to the definition
    const posts = await client.query(queries['post.all']);

    console.log({ greeting, posts });
  }

  {
    // we can also use string based path if we prefer that
    // (but then you can't click your way to the backend)
    const greeting = await client.query('greeting', { hello: 'string' });
    const posts = await client.query('post.all');

    console.log({ greeting, posts });
  }

  // nested function-call API
  // "Go to definition" doesn't work
  {
    const greeting = await proxyClient.greeting({ hello: 'string' });
    const posts = await proxyClient.post.all();
    console.log({ greeting, posts });
  }

  // "flat" function-call API
  // "Go to definition" does work
  // users who dislike the square brackets should avoid nested routers 🤷‍♂️
  {
    const greeting = await flatClient.greeting({ hello: 'string' });
    const posts = await flatClient['post.all']();
    console.log({ greeting, posts });
  }
}

main();
