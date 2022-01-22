import {
  createRouterWithContext,
  initTRPC,
  pipedResolver,
} from '../../src/trpc/server';

////////////////////// app ////////////////////////////
// context
type Context = {
  user?: {
    id: string;
  };
};

export const trpc = initTRPC<Context>();
