> CodeSandbox link: https://codesandbox.io/s/github/katt/trpc-procedure-play?file=/src/client.ts
>
> Repo: https://github.com/KATT/trpc-procedure-play

# [tRPC](https://trpc.io) V10 play

Early draft of how a future [tRPC](https://trpc.io)-version could look like.

## Play with it!

> Do not try to run the project - there's no code implemented, only TypeScript ergonomics.

1. Go to `src/server.ts` in CodeSandbox
2. Try adding/removing/changing queries and mutations.
3. Go to `src/client.ts` and play around

### Big router performance testing

- Run `yarn codegen` (modify `./scripts/generate-big-f-router.ts` if you want)
- Play with `./big/client.ts` and the connected routers to see how long it takes to get feedback
- Potentially run `yarn tsc --noEmit --extendedDiagnostics --watch .big/client.ts` on the side

## Goals & features

- **More ergonomic API for creating procedures** and building out your backend
- **CMD+Click** from a your frontend and jump straight into the backend procedure. This will work with `react-query` as well!
- **Infer expected errors** as well as data - unsure if this is useful yet or if it'll make it, but pretty sure it'll be nice to have.
- **Enabling having a watchers**-based structure - as you see, that `createRouter()` could easily be automatically generated from a file/folder structure.
- **Better scaling** than current structure - the TypeScript server starts choking a bit when you get close to 100 procedures in your backend


## Late night ideas

### Refactor procedure

```tsx
// Add `input` envelope to allow for extras
type CallContext = Record<string, unknown>;

export type Procedure<Params> = (Params['input_in'] extends UnsetMarker
  ? (opts?: { input?: undefined; context: CallContext}) => Promise<TOutput>
  : TInput extends undefined
  ? (opts?: { input?: Params['input_in']; context: CallContext}) => Promise<TOutput>
  : (opts: { input: Params['input_in']; context: CallContext}) => Promise<TOutput>) &
  ProcedureMarker;
```

### When using React

```tsx
import {initTRPC} from "@trpc/react/server";

const trpc = initTRPC<Context>()


/////////// app root router //////////
export const appRouter = trpc.router({
  queries: {
    greeting: trpc.query
      .input(
        z.string(),
      )
      .resolve((params) => {
        return {
          greeting: 'hello ' + params.ctx.user?.id ?? params.input.hello,
        };
      }),
  }
})


// Decorate with react-query options
type CallContext = Record<string, unknown>;

export type Procedure<Params> = (Params['input_in'] extends UnsetMarker
  ? (opts?: ProcedureOptions<undefined>) => Promise<TOutput>
  : TInput extends undefined
  ? (opts?: { input?: Params['input_in']; context: CallContext}) => Promise<TOutput>
  : (opts: { input: Params['input_in']; context: CallContext}) => Promise<TOutput>) &
  ProcedureMarker;


// usage:
trpc.useQuery.greeting({
  input: 'world,
  context: {},
  // ...react-query props
})
// or
trpc.query.greeting.use({
  input: 'world,
  context: {},
  // ...react-query props
})
```