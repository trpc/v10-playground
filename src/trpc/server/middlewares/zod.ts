import type { z } from 'zod';
import {
  error,
  InputSchema,
  MiddlewareFunction,
  ProcedureResultError,
} from '..';

/***
 * Utility for creating a zod middleware
 */
export function zod<TInputParams, TSchema extends z.ZodTypeAny>(
  schema: TSchema,
): MiddlewareFunction<
  TInputParams,
  TInputParams & InputSchema<z.input<TSchema>, z.output<TSchema>>,
  ProcedureResultError<{
    code: 'BAD_REQUEST';
    zod: z.ZodFormattedError<z.input<TSchema>>;
  }>
> {
  type zInput = z.input<TSchema>;
  type zOutput = z.output<TSchema>;
  return async function parser(params) {
    const rawInput: zInput = (params as any).rawInput;
    const result: z.SafeParseReturnType<zInput, zOutput> =
      await schema.safeParseAsync(rawInput);

    if (result.success) {
      return params.next({
        ...params,
        input: result,
        _input_in: null as any,
        _input_out: null as any,
      });
    }

    const zod = (result as z.SafeParseError<zInput>).error.format();
    const err = error({
      code: 'BAD_REQUEST',
      zod,
    });
    return err;
  };
}
