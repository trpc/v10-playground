import { z } from 'zod';
import { createNewContext, initTRPC, merge } from './trpc/server';

////////// app bootstrap & middlewares ////////
type Context = {
  user?: {
    id: string;
  };
};
const trpc = initTRPC<Context>();

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

// mock db
let postsDb = [
  {
    id: '1',
    title: 'hello tRPC',
    body: 'this is a preview of v10',
    userId: 'KATT',
  },
];

interface CheckUserOwnsPostParams {
  ctx: {
    user: { id: string };
  };
  input: {
    id: string;
  };
}
const checkUserOwnsPost = createNewContext<CheckUserOwnsPostParams>()(
  (params) => {
    const post = postsDb.find((post) => post.id === params.input.id);

    if (!post || params.ctx.user.id !== post.userId) {
      return {
        error: {
          code: 'FORBIDDEN',
        },
      };
    }
    return {
      ctx: {
        ...params.ctx,
        post,
      },
    };
  },
);

function userOwnsPost<TSchema extends z.ZodObject<{ id: z.ZodString }>>(
  schema: TSchema,
) {
  return merge<Context>()(
    //
    isAuthed(),
    trpc.zod(schema),
    checkUserOwnsPost(),
  )();
}

/////////// app root router //////////
export const appRouter = trpc.router({
  queries: {
    // simple procedure without args avialable at `post.all`
    'post.all': (_params) => {
      return {
        data: postsDb,
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
        // `ctx.user` is now `NonNullable`
        return { data: `your id is ${ctx.user.id}` };
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
        if (Math.random() < 0.5) {
          return {
            data: 'y',
          };
        }
        return {
          data: post,
        };
      },
    ),
    // mutation with auth + input
    'post.edit': trpc.resolver(
      userOwnsPost(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          body: z.string().optional(),
        }),
      ),
      (params) => {
        params.ctx.user.id;
        params.ctx.post;

        return {
          data: params,
        };
      },
    ),
  },
});
