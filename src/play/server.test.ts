import { expectTypeOf } from 'expect-type';
import { appRouter } from './server';

///////////// this below are just tests that the type checking is doing it's thing right ////////////
async function main() {
  {
    // query 'whoami'
    const result = await appRouter.queries.viewerWhoAmi();
  }
  {
    const output = await appRouter.mutations.editOrg({
      organizationId: '123',
      data: {
        name: 'asd',
        len: 'asdasd',
      },
    });
    expectTypeOf(output).toMatchTypeOf<{
      data: {
        name: string;
        len: number;
      };
      organizationId: string;
    }>();
  }
  {
    const output = await appRouter.mutations.updateToken('hey');

    expectTypeOf(output).toMatchTypeOf<'ok'>();
  }

  {
    // if you hover result we can see that we can infer both the result and every possible expected error
    // const result = await appRouter.queries.greeting({ hello: 'there' });
    // if ('error' in result && result.error) {
    //   if ('zod' in result.error) {
    //     // zod error inferred - useful for forms w/o libs
    //     console.log(result.error.zod.hello?._errors);
    //   }
    // } else {
    //   console.log(result);
    // }
    // // some type testing below
    // type MyProcedure = inferProcedure<typeof appRouter['queries']['greeting']>;
    // expectTypeOf<MyProcedure['ctx']>().toMatchTypeOf<{
    //   user?: { id: string };
    // }>();
    // expectTypeOf<MyProcedure['data']>().toMatchTypeOf<{
    //   greeting: string;
    // }>();
    // expectTypeOf<MyProcedure['_input_in']>().toMatchTypeOf<{
    //   hello: string;
    //   lengthOf?: string;
    // }>();
    // expectTypeOf<MyProcedure['_input_out']>().toMatchTypeOf<{
    //   hello: string;
    //   lengthOf: number;
    // }>();
  }
  // {
  //   // no leaky
  //   const trpc = initTRPC();
  //   trpc.router({
  //     queries: {
  //       test: trpc.resolver(() => {
  //         return 'ok';
  //       }),
  //     },
  //     // @ts-expect-error should error
  //     doesNotExist: {},
  //   });
  // }
  // {
  //   const result = await appRouter.mutations['fireAndForget']('hey');
  //   console.log(result);
  // }
}

main();
