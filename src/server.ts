import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import { initTRPC } from './trpc/server';

////////////////////// app ////////////////////////////
type Context = {
  user?: {
    id: string;
  };
};

// boilerplate for each app, in like a utils
const trpc = initTRPC<Context>();

////////// app middlewares ////////
const isAuthed = trpc.newContext((params) => {
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
export const appRouter = trpc.router({
  queries: {
    'post.all': (params) => {
      expectTypeOf<typeof params>().toMatchTypeOf<{
        ctx: Context;
      }>();
      return {
        data: [
          {
            id: 1,
            title: 'hello tRPC',
          },
        ],
      };
    },
    greeting: trpc.resolver(
      // adds zod input validation
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        type TContext = typeof params.ctx;
        type TInput = typeof params.input;
        expectTypeOf<TContext>().toMatchTypeOf<{ user?: { id: string } }>();
        expectTypeOf<TInput>().toMatchTypeOf<{
          hello: string;
          lengthOf: number;
        }>();

        return {
          data: {
            greeting: 'hello ' + params.ctx.user?.id ?? params.input.hello,
          },
        };
      },
    ),
    whoami: trpc.resolver(
      //
      isAuthed(),
      ({ ctx }) => {
        return { data: `your id is ${ctx.user.id}` };
      },
    ),
  },
});
