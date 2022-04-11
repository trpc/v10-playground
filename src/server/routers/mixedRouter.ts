import { z } from 'zod';
import { isAuthed, procedure, trpc } from '../context';

/**
 * A reusable combination of an input + middleware that can be reused.
 * Accepts a Zod-schema as a generic.
 */
export function isPartofOrg<
  TSchema extends z.ZodObject<{ organizationId: z.ZodString }>,
>(schema: TSchema) {
  return procedure.input(schema).use((params) => {
    const { ctx, input } = params;
    const { user } = ctx;
    if (!user) {
      throw new Error('UNAUTHORIZED');
    }

    if (
      !user.memberships.some(
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
// Router with some mixed procedures

export const mixedRouter = trpc.router({
  queries: {
    // procedure with input validation called `greeting`
    greeting: procedure
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
    viewerWhoAmi: procedure.use(isAuthed).resolve(({ ctx }) => {
      // `isAuthed()` will propagate new `ctx`
      // `ctx.user` is now `NonNullable`
      return `your id is ${ctx.user.id}`;
    }),
  },

  mutations: {
    fireAndForget: procedure.input(z.string()).resolve(() => {
      // no return
    }),
    editOrg: procedure
      .concat(
        isPartofOrg(
          z.object({
            organizationId: z.string(),
            data: z
              .object({
                name: z.string(),
              })
              .partial(),
          }),
        ),
      )
      .resolve(({ input }) => {
        // - User is guaranteed to be part of the organization queried
        //-  `input` is of type:
        // {
        //   data: {
        //       name: string;
        //   };
        //   organizationId: string;
        // }
        // [.... logic]
        return {
          id: input.organizationId,
          ...input.data,
        };
      }),

    updateTokenHappy: procedure
      .input(z.string())
      .output(z.literal('ok'))
      .resolve(() => {
        return 'ok';
      }),
    updateToken: procedure
      .input(z.string())
      .output(z.literal('ok'))
      // @ts-expect-error output validation
      .resolve(({ input }) => {
        return input;
      }),

    voidResponse: procedure
      .output(z.void())
      // @ts-expect-error output validation
      .resolve(({ input }) => {
        return input;
      }),
  },
});
