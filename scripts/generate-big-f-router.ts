import fs from 'fs';

const NUM_ROUTERS = 100;
const NUM_PROCEDURES_PER_ROUTER = 30;

const WRAPPER = `
import { trpc } from '../context';
import { z } from 'zod';
__IMPORTS__

export const __ROUTER_NAME__ = trpc.router({
  queries: {
    __CONTENT__
  }
});

`.trim();

const SERVER_DIR = __dirname + '/../.big/server/routers';

// first cleanup all routers
const files = fs.readdirSync(SERVER_DIR);
for (const file of files) {
  if (file.endsWith('.ts')) {
    fs.rmSync(SERVER_DIR + '/' + file);
  }
}

for (let routerIndex = 0; routerIndex < NUM_ROUTERS; routerIndex++) {
  // generate router files
  const routerFile = [];
  for (let procIndex = 0; procIndex < NUM_PROCEDURES_PER_ROUTER; procIndex++) {
    // generate procedures in each file
    routerFile.push(
      '\n' +
        `
  r${routerIndex}q${procIndex}: trpc.resolver(
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
        input: params.input,
      }
    }
  ),
`.trim(),
    );
  }
  // write router file
  const contents = WRAPPER.replace('__CONTENT__', routerFile.join('\n'))
    .replace('__IMPORTS__', '')
    .replace('__ROUTER_NAME__', `router${routerIndex}`);
  fs.writeFileSync(SERVER_DIR + `/router${routerIndex}.ts`, contents);
}
// write `_app.ts` index file that combines all the routers
const imports = new Array(NUM_ROUTERS)
  .fill('')
  .map((_, index) => `import { router${index} } from './router${index}';`)
  .join('\n');
let indexFile = `
import { trpc } from '../context';
${imports}

export const appRouter = trpc.mergeRouters(
${new Array(NUM_ROUTERS)
  .fill('')
  .map((_, index) => `router${index}`)
  .join(',\n')}
) 
`.trim();

fs.writeFileSync(SERVER_DIR + '/_app.ts', indexFile);
