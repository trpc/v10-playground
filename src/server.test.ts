import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import { appRouter } from './server';
import { createClient } from './trpc/client';
import { createRouterProxy } from './trpc/client/createRouterProxy';
import { inferProcedure, initTRPC } from './trpc/server';

const client = createClient<typeof appRouter>();
const { mutations } = createRouterProxy<typeof appRouter>();
///////////// this below are just tests that the type checking is doing it's thing right ////////////
async function main() {
  {
    // query 'whoami'
    const result = await appRouter.queries['viewer.whoami']({ ctx: {} });
    if ('error' in result) {
      expectTypeOf<typeof result['error']>().toMatchTypeOf<
        | {
            code: 'UNAUTHORIZED';
          }
        | {
            code: 'BAD_REQUEST';
            zod: z.ZodFormattedError<{
              lengthOf?: string | undefined;
              hello: string;
            }>;
          }
      >();
    }
    if ('data' in result) {
      expectTypeOf(result.data).toMatchTypeOf<string>();
    }
  }
  {
    // if you hover result we can see that we can infer both the result and every possible expected error
    const result = await appRouter.queries.greeting({ ctx: {} });
    if ('error' in result && result.error) {
      if ('zod' in result.error) {
        // zod error inferred - useful for forms w/o libs
        console.log(result.error.zod.hello?._errors);
      }
    } else if ('data' in result) {
      console.log(result.data);
    } else {
      throw new Error("Procedure didn't return data");
    }

    // some type testing below
    type MyProcedure = inferProcedure<typeof appRouter['queries']['greeting']>;

    expectTypeOf<MyProcedure['ctx']>().toMatchTypeOf<{
      user?: { id: string };
    }>();

    expectTypeOf<MyProcedure['data']>().toMatchTypeOf<{
      data: {
        greeting: string;
      };
    }>();

    expectTypeOf<MyProcedure['_input_in']>().toMatchTypeOf<{
      hello: string;
      lengthOf?: string;
    }>();
    expectTypeOf<MyProcedure['_input_out']>().toMatchTypeOf<{
      hello: string;
      lengthOf: number;
    }>();
  }
  {
    // no leaky
    const trpc = initTRPC();
    trpc.router({
      queries: {
        test: () => {
          return {
            data: 'ok',
          };
        },
      },
      // @ts-expect-error should error
      doesNotExist: {},
    });
  }
  {
    const result = await client.mutation(mutations['post.add'], {
      title: 'asd',
      body: 'asd',
    });
    if ('error' in result) {
      console.log(result.error);
    }
    if ('data' in result) {
      console.log(result.data);
    }
  }
  {
    const result = await client.mutation(mutations['post.edit'], {
      id: '123',
    });
    if ('error' in result) {
      console.log(result.error);
    }
    if ('data' in result) {
      console.log(result.data);
    }
  }
}
main();
