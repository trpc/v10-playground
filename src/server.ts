import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import {
  contextSwapperMiddleware,
  createRouterWithContext,
  inferProcedure,
  pipedResolver,
  zodMiddleware,
} from './trpc/server';

////////////////////// app ////////////////////////////
// context
type TestContext = {
  user?: {
    id: string;
  };
};

// boilerplate for each app, in like a utils
const resolver = pipedResolver<TestContext>();
const swapContext = contextSwapperMiddleware<TestContext>();
const createRouter = createRouterWithContext<TestContext>();

////////// app middlewares ////////
const isAuthed = swapContext((params) => {
  if (!params.ctx.user) {
    return {
      error: {
        code: 'UNAUTHORIZED',
      },
    };
  }
  return {
    ctx: {
      ...params.ctx,
      user: params.ctx.user,
    },
  };
});

/////////// app root router //////////
export const appRouter = createRouter({
  queries: {
    'post.all': ({ ctx }) => {
      return {
        data: [
          {
            id: 1,
            title: 'hello tRPC',
          },
        ],
      };
    },
    greeting: resolver(
      // adds zod input validation
      zodMiddleware(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      // swaps context to make sure the user is authenticated
      // FIXME:
      // isAuthed(),
      // manual version of the `isAuthed()` above
      async (params) => {
        if (!params.ctx.user) {
          return {
            error: {
              code: 'UNAUTHORIZED',
            },
          };
        }
        return params.next({
          ...params,
          ctx: {
            ...params.ctx,
            user: params.ctx.user,
          },
        });
      },
      (params) => {
        type TContext = typeof params.ctx;
        type TInput = typeof params.input;
        expectTypeOf<TContext>().toMatchTypeOf<{ user: { id: string } }>();
        expectTypeOf<TInput>().toMatchTypeOf<{
          hello: string;
          lengthOf: number;
        }>();

        return {
          data: {
            greeting: 'hello ' + params.ctx.user.id ?? params.input.hello,
          },
        };
      },
    ),
  },
});

async function main() {
  // if you hover result we can see that we can infer both the result and every possible expected error
  const result = await appRouter.queries.greeting({ ctx: {} });
  if ('error' in result && result.error) {
    console.log(result.error);
    if ('zod' in result.error) {
      // zod error inferred - useful for forms w/o libs
      console.log(result.error.zod.hello?._errors);
    }
  } else {
    console.log(result.data);
  }

  // some type testing below
  type MyProcedure = inferProcedure<typeof appRouter['queries']['greeting']>;

  expectTypeOf<MyProcedure['ctx']>().toMatchTypeOf<{
    user: { id: string };
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
main();
