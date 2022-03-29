import { z } from 'zod';
import { inferMiddlewareContext, MiddlewareFunction } from './middlewares';
import {
  ParserWithoutInput,
  ParserWithInputOutput,
  Parser,
  inferParser,
} from './parsers';
import { Overwrite } from './utils';

// type ProcedureBuilder
type MaybePromise<T> = T | Promise<T>;
interface ResolveOptions<TContext, TInput> {
  ctx: TContext;
  input: TInput;
}
export type ProcedureType = 'query' | 'mutation' | 'subscription';

export type Procedure<_TContext, TInput, TOutput> = TInput extends undefined
  ? (input?: TInput) => Promise<TOutput>
  : (input: TInput) => Promise<TOutput>;

export interface ProcedureReturnInput<TContext, TInput, TParsedInput, TOutput> {
  input<$TInput, $TParsedInput>(
    schema: ParserWithInputOutput<$TInput, $TParsedInput>,
  ): Omit<
    ProcedureReturnInput<TContext, $TInput, $TParsedInput, TOutput>,
    'input'
  >;
  input<$TParser extends Parser>(
    schema: $TParser,
  ): Omit<
    ProcedureReturnInput<
      TContext,
      inferParser<$TParser>['in'],
      inferParser<$TParser>['out'],
      TOutput
    >,
    'input'
  >;

  // middleware<$MiddlewareFn extends MiddlewareFunction<TContext>>()
  use<$MiddlewareFn extends MiddlewareFunction<TContext, any>>(
    fn: $MiddlewareFn,
  ): ProcedureReturnInput<
    Overwrite<TContext, inferMiddlewareContext<$MiddlewareFn>>,
    TInput,
    TParsedInput,
    TOutput
  >;
  resolve<$TOutput>(
    resolver: (
      opts: ResolveOptions<TContext, TParsedInput>,
    ) => MaybePromise<$TOutput>,
  ): TOutput extends unknown
    ? Procedure<TContext, TInput, $TOutput>
    : Procedure<TContext, TInput, TOutput>;
}

export function createProcedureFactory<TContext>() {
  return function createProcedure(): ProcedureReturnInput<
    TContext,
    undefined,
    undefined,
    undefined
  > {
    throw new Error('unimplemented');
  };
}

type Context = {
  req?: string;
  user?: {
    id: string;
  };
};

function createMiddlewareFactory<TContext>() {
  return function newContextFactory<
    TInputContext extends TContext,
    TNewContext,
  >(middleware: MiddlewareFunction<TInputContext, TNewContext>) {
    return middleware;
  };
}

const createMiddleware = createMiddlewareFactory<Context>();

// This is a non-working attempt:
const isAuthed = createMiddleware((opts) => {
  if (!opts.ctx.user) {
    throw new Error('Unauthed');
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user: opts.ctx.user,
    },
  });
});
