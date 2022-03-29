import { z } from 'zod';
import { inferMiddlewareContext, MiddlewareFunction } from './middlewares';
import { Parser, ParserWithInputOutput } from './parsers';

// type ProcedureBuilder
type MaybePromise<T> = T | Promise<T>;
interface ResolveOptions<TContext, TInput> {
  ctx: TContext;
  input: TInput;
}
export type ProcedureType = 'query' | 'mutation' | 'subscription';

export type Procedure<TInput, TOutput> = TInput extends undefined
  ? (input?: TInput) => Promise<TOutput>
  : (input: TInput) => Promise<TOutput>;

type Overwrite<T, U> = Omit<T, keyof U> & U;
export interface ProcedureReturnInput<TContext, TInput, TParsedInput, TOutput> {
  input<$TInput, $TParsedInput>(
    schema: ParserWithInputOutput<$TInput, $TParsedInput>,
  ): Omit<
    ProcedureReturnInput<TContext, $TInput, $TParsedInput, TOutput>,
    'input'
  >;
  input<$TInput>(
    schema: Parser<$TInput>,
  ): Omit<ProcedureReturnInput<TContext, $TInput, $TInput, TOutput>, 'input'>;

  // middleware<$MiddlewareFn extends MiddlewareFunction<TContext>>()
  middleware<$MiddlewareFn extends MiddlewareFunction<TContext, any>>(
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
    ? Procedure<TInput, $TOutput>
    : Procedure<TInput, TOutput>;
}

function procedure(): ProcedureReturnInput<
  {
    user?: {
      id: string;
    };
    '...': 'bla';
  },
  undefined,
  undefined,
  undefined
> {
  throw new Error('unimplemented');
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
// TODO: how to make reusable middlewares
const fn = procedure()
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .middleware(async (opts) => {
    const res = await opts.next({
      ctx: {
        ...opts.ctx,
        test: 'hello',
      },
    });
    return res;
  })
  .middleware(isAuthed)
  .resolve((opts) => {
    console.log(opts.ctx);
    console.log(opts.ctx.user.id); // yay
    console.log(opts.ctx.test); // <-- yay
    return {
      foo: 'bar',
    };
  });
// Usage

// trpc
//   .procedure()
//   .input(z.object())
//   .output()
