import {
  contextSwapperMiddleware,
  createRouterWithContext,
  pipedResolver,
} from '../../src/trpc/server';

////////////////////// app ////////////////////////////
// context
type TestContext = {
  user?: {
    id: string;
  };
};

// boilerplate for each app, in like a utils
export const resolver = pipedResolver<TestContext>();
export const createRouter = createRouterWithContext<TestContext>();
