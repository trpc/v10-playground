import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import { appRouter } from './server';
import { inferProcedure } from './trpc/server';

///////////// this below are just tests that the type checking is doing it's thing right ////////////
async function main() {
  {
    // query 'whoami'
    const result = await appRouter.queries.whoami({ ctx: {} });
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
}
main();
