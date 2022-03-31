import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import { initTRPC } from './lib';
import { inferMiddlewareParams } from './lib/middleware';

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

function isPartOfOrg<
  TSchema extends z.ZodObject<{ organizationId: z.ZodString }>,
>(schema: TSchema) {
  return trpc.middleware(async (params) => {
    const { ctx, rawInput } = params;
    const { user } = ctx;
    if (!user) {
      throw new Error('UNAUTHORIZED');
    }
    const result = await schema.safeParseAsync(rawInput);
    if (!result.success) {
      throw new Error('BAD_INPUT');
    }
    const input = result.data as TSchema['_output'];
    if (
      user.memberships.some(
        (membership) => membership.organizationId !== input.organizationId,
      )
    ) {
      throw new Error('FORBIDDEN');
    }

    return params.next({
      input,
      _input_in: undefined as never as TSchema['_input'],
      ctx: {
        ...ctx,
        user,
      },
    });
  });
}

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

function isPartOfOrg2<
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
      input: input as TSchema['_output'],
      _input_in: undefined as never as TSchema['_input'],
      ctx: {
        ...ctx,
        user,
      },
    });
  });
}

/////////// app root router //////////
export const appRouter = trpc.router({
  queries: {
    // simple procedure without args avialable at postAll`
    postList: async () => postsDb,
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
    tetete: proc
      .use((params) => {
        return params.next({
          _input_in: '_input_in' as const,
          input: 'input' as const,
          ctx: 'ctx' as const,
        });
      })
      .resolve(({ input, ctx }) => {
        expectTypeOf(ctx).toMatchTypeOf<'ctx'>();
        expectTypeOf(input).toMatchTypeOf<'input'>();
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
      .use(
        isPartOfOrg(
          z.object({
            organizationId: z.string(),
            data: z.object({
              name: z.string(),
            }),
          }),
        ),
      )
      .resolve(({ ctx, input }) => {
        console.log(input); // <--------- todo

        console.log(ctx, ctx);
        console.log(ctx.user.id);
      }),
    editOrg2: proc
      .apply(
        isPartOfOrg2(
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
        console.log(input); // <--------- todo

        console.log(ctx.user.id);
      }),
  },
});

const fn = isPartOfOrg2(
  z.object({
    organizationId: z.string(),
    data: z.object({
      name: z.string(),
      len: z.string().transform((v) => v.length),
    }),
  }),
).resolve(({ input }) => {});
