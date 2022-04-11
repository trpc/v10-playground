import { trpc } from '../context';
import { postRouter } from './postRouter';
import { mixedRouter } from './mixedRouter';
import { orgRouter } from './orgRouter';

/**
 * Create the app's router based on the mixedRouter and postRouter.
 */
export const appRouter = trpc.mergeRouters(mixedRouter, postRouter, orgRouter);
