> CodeSandbox link: https://codesandbox.io/s/github/katt/trpc-procedure-play?file=/src/client.ts
>
> Repo: https://github.com/KATT/trpc-procedure-play

# trpc-procedure-play

Early draft of how a future tRPC-version could look like.

## Play with it!

1. Go to `src/server.ts` in CodeSandbox
2. Try adding/removing/changing queries and mutations.
3. Go to `src/client.ts` and play around

## Goals & features

- **More ergonomic API for creating procedures** and building out your backend
- **CMD+Click** from a your frontend and jump straight into the backend procedure
- **Infer expected errors** as well as data - unsure if this is useful yet or if it'll make it, but pretty sure it'll be nice to have.
- **Enabling having creating a watchers**-based structure - as you see, that `createRouter()` could easily be automatically generated from a file/folder structure.
- **Better scaling** than current structure - the TypeScript server starts choking a bit when you get close to 100 procedures in your backend


## Current issues

- Unable to infer the correct error shape from `isAuthed()` from the context swap middleware - [#1](https://github.com/KATT/trpc-procedure-play/issues/1)
