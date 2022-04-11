import { trpc } from '../context';
import { postRouter } from './postRouter';
import { mixedRouter } from './mixedRouter';
import { orgRouter } from './orgRouter';
import { ZodError } from 'zod';

const formatErrors = trpc.router({
  errorFormatter({ error, shape }) {
    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          type: 'zod' as const,
          errors: error.cause.errors,
        },
      };
    }
    return shape;
  },
});

/**
 * Create the app's router based on the mixedRouter and postRouter.
 */
export const appRouter = trpc.mergeRouters(
  formatErrors,
  mixedRouter,
  postRouter,
  orgRouter,
);
