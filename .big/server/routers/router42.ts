import { trpc } from '../context';
import { z } from 'zod';

export const router42 = trpc.router({
  queries: {
    r42q0: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q1: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q2: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q3: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q4: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q5: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q6: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q7: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q8: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),

    r42q9: trpc.resolver(
      trpc.zod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        return {
          data: {
            input: params.input,
          },
        };
      },
    ),
  },
});
