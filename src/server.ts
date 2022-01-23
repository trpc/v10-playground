import { z } from 'zod';
import { initTRPC } from './trpc/server';

////////// app bootstrap & middlewares ////////
type Context = {
  user?: {
    id: string;
  };
};
const trpc = initTRPC<Context>();

const isAuthed = trpc.newContext((params) => {
  if (!params.ctx.user) {
    return trpc.error({
      code: 'UNAUTHORIZED',
    });
  }
  return {
    ctx: {
      ...params.ctx,
      user: params.ctx.user,
    },
  };
});

// mock db
let postsDb = [
  {
    id: '1',
    title: 'hello tRPC',
    body: 'this is a preview of v10',
    userId: 'KATT',
  },
];

/////////// app root router //////////
export const appRouter = trpc.router({
  queries: {
    // simple procedure without args avialable at `post.all`
    'post.all': (_params) => {
      return postsDb;
    },
    // simple procedure without args avialable at `post.all`
    'post.byId': trpc.resolver(() => {
      return {
        data: postsDb,
      };
    }),
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
          greeting: 'hello ' + params.ctx.user?.id ?? params.input.hello,
        };
      },
    ),
    // procedure with auth
    'viewer.whoami': trpc.resolver(
      // `isAuthed()` will propagate new `ctx`
      isAuthed(),
      ({ ctx }) => {
        // `ctx.user` is now `NonNullable`
        return `your id is ${ctx.user.id}`;
      },
    ),
  },
  mutations: {
    // mutation with auth + input
    'post.add': trpc.resolver(
      trpc.zod(
        z.object({
          title: z.string(),
          body: z.string(),
        }),
      ),
      isAuthed(),
      ({ input, ctx }) => {
        const post: typeof postsDb[number] = {
          ...input,
          id: `${Math.random()}`,
          userId: ctx.user.id,
        };
        postsDb.push(post);
        return {
          data: post,
        };
      },
    ),
  },
});
