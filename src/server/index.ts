import { trpc } from './context';
import { postRouter } from './routers/postRouter';
import { mixedRouter } from './routers/mixedRouter';

/**
 * Create the app's router based on the mixedRouter and postRouter.
 */
export const appRouter = trpc.mergeRouters(mixedRouter, postRouter);
