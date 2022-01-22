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
    // simple procedure without args avialable at `post.all`
    'post.all': (_params) => {
      return {
        data: [
          {
            id: 1,
            title: 'hello tRPC',
          },
        ],
      };
    },
    // procedure with input validation called `greeting`
    greeting: trpc.resolver(
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
        return {
          data: {
            greeting: 'hello ' + params.ctx.user?.id ?? params.input.hello,
          },
        };
      },
    ),
    // procedure with auth
    'viewer.whoami': trpc.resolver(
      // `isAuthed()` will propagate new `ctx`
      isAuthed(),
      ({ ctx }) => {
        return { data: `your id is ${ctx.user.id}` };
      },
    ),
  },
  mutations: {},
});
