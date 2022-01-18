# trpc-procedure-play

Early draft of how a future tRPC-version could look like.

Head in to `src/index.ts`, try adding/removing/changing queries and mutations.

## Goals & features

- More ergonomic API for creating procedures and building out your backend
- Better scaling than current structure - the TypeScript server starts choking a bit when you get close to 100 procedures in your backend
- Infer expected errors as well as data - unsure if this is useful yet or if it'll make it, but pretty sure it'll be nice to have.
- Foundation for creating a watcher-based structure - as you see, that `createRouter()` could easily be automatically generated from a file/folder structure.

## Current issues

- Unable to infer the correct error shape from `isAuthed()` from the context swap middleware
