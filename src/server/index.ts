import { trpc } from './context';
import { postRouter } from './routers/postRouter';
import { mixedRouter } from './routers/mixedRouter';
import { orgRouter } from './routers/orgRouter';

/**
 * Create the app's router based on the mixedRouter and postRouter.
 */
export const appRouter = trpc.mergeRouters(mixedRouter, postRouter, orgRouter);
