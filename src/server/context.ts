import { initTRPC } from '../@trpc/server';

////////// app bootstrap & middlewares ////////
export type Context = {
  db?: {};
  user?: {
    id: string;
    memberships: {
      organizationId: string;
    }[];
  };
};
export const trpc = initTRPC<Context>();

export const procedure = trpc.procedure;

/**
 * Middleware that checks if the user is logged in.
 */
export const isAuthed = trpc.middleware((params) => {
  if (!params.ctx.user) {
    throw new Error('zup');
  }
  return params.next({
    ctx: {
      user: params.ctx.user,
    },
  });
});
