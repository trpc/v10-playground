import fs from 'fs';

const NUM_FILES_TO_GENERATE = 100;
const NUM_PROCEDURES_TO_GENERATE = 10;
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
// Big F̶u̶c̶ Fantastic Router

const SERVER_DIR = __dirname + '/../.big/server/routers';
for (let routerIndex = 0; routerIndex < NUM_FILES_TO_GENERATE; routerIndex++) {
  let [prefix, suffix] = WRAPPER.split('__CONTENT__');
  prefix = prefix.replace('__IMPORTS__', '');
  prefix = prefix.replace('__ROUTER_NAME__', `router${routerIndex}`);
  const routerFile = [prefix];
  for (let procIndex = 0; procIndex < NUM_PROCEDURES_TO_GENERATE; procIndex++) {
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
        data: {
          input: params.input,
        }
      }
    }
  ),
`.trim(),
    );
  }
  routerFile.push(suffix);
  const contents = routerFile.join('\n  ');
  fs.writeFileSync(SERVER_DIR + `/router${routerIndex}.ts`, contents);
}
const imports = new Array(NUM_FILES_TO_GENERATE)
  .fill('')
  .map((_, index) => `import { router${index} } from './router${index}';`)
  .join('\n');
const content = new Array(NUM_FILES_TO_GENERATE)
  .fill('')
  .map((_, index) => `...router${index}.queries,`)
  .join('\n');
let indexFile = WRAPPER;
indexFile = indexFile.replace('__IMPORTS__', imports);
indexFile = indexFile.replace('__ROUTER_NAME__', `appRouter`);
indexFile = indexFile.replace('__CONTENT__', content);

fs.writeFileSync(SERVER_DIR + '/_app.ts', indexFile);
