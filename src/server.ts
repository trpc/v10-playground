import { z } from 'zod';
import { initTRPC } from './trpc/server';

////////// app bootstrap & middlewares ////////
type Context = {
  db?: {};
  user?: {
    id: string;
    memberships: {
      organizationId: string;
    }[];
  };
};
const trpc = initTRPC<Context>();

const isAuthed = trpc.middleware((params) => {
  if (!params.ctx.user) {
    throw new Error('zup');
  }
  return params.next({
    ctx: {
      user: params.ctx.user,
    },
  });
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

const proc = trpc.procedure;
// const authedProcedure = proc.use(isAuthed);

// A reusable combination of an input + middleware that can be reused
function isPartofOrg<
  TSchema extends z.ZodObject<{ organizationId: z.ZodString }>,
>(schema: TSchema) {
  return proc.input(schema).use((params) => {
    const { ctx, input } = params;
    const { user } = ctx;
    if (!user) {
      throw new Error('UNAUTHORIZED');
    }

    if (
      user.memberships.some(
        (membership) => membership.organizationId !== input.organizationId,
      )
    ) {
      throw new Error('FORBIDDEN');
    }

    return params.next({
      ctx: {
        user,
      },
    });
  });
}

/////////// app root router //////////
export const appRouter = trpc.router({
  queries: {
    // simple procedure without args avialable at postAll`
    postList: proc.resolve(() => postsDb),
    // get post by id or 404 if it's not found
    postById: proc
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .resolve(({ input }) => {
        const post = postsDb.find((post) => post.id === input.id);
        if (!post) {
          throw new Error('NOT_FOUND');
        }
        return {
          data: postsDb,
        };
      }),
    // procedure with input validation called `greeting`
    greeting: proc
      .input(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      )
      .resolve((params) => {
        return {
          greeting: 'hello ' + params.ctx.user?.id ?? params.input.hello,
        };
      }),
    // procedure with auth
    viewerWhoAmi: proc.use(isAuthed).resolve(({ ctx }) => {
      // `isAuthed()` will propagate new `ctx`
      // `ctx.user` is now `NonNullable`
      return `your id is ${ctx.user.id}`;
    }),
  },

  mutations: {
    // mutation with auth + input
    postAdd: proc
      .input(
        z.object({
          title: z.string(),
          body: z.string(),
        }),
      )
      .use(isAuthed)
      .resolve(({ ctx, input }) => {
        const post: typeof postsDb[number] = {
          ...input,
          id: `${Math.random()}`,
          userId: ctx.user.id,
        };
        postsDb.push(post);
        return {
          data: post,
        };
      }),
    fireAndForget: proc.input(z.string()).resolve(() => {
      // no return
    }),
    editOrg: proc
      .use((params) =>
        params.next({
          ctx: {
            // just testing that this doesn't get lost along the way
            foo: {
              bar: 'bar',
            },
          },
        }),
      )
      .apply(
        isPartofOrg(
          z.object({
            organizationId: z.string(),
            data: z.object({
              name: z.string(),
              len: z.string().transform((v) => v.length),
            }),
          }),
        ),
      )
      .resolve(({ ctx, input }) => {
        console.log(input.data.len);
        console.log(ctx.foo.bar);

        console.log(ctx.user.id);
        return input;
      }),

    updateTokenHappy: proc
      .input(z.string())
      .output(z.literal('ok'))
      .resolve(() => {
        return 'ok';
      }),
    updateToken: proc
      .input(z.string())
      .output(z.literal('ok'))
      // @ts-expect-error output validation
      .resolve(({ input }) => {
        return input;
      }),

    voidResponse: proc
      .output(z.void())
      // @ts-expect-error output validation
      .resolve(({ input }) => {
        return input;
      }),
  },
});
