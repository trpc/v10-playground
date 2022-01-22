import fs from 'fs';

const NUM_ROUTERS = 100;
const NUM_PROCEDURES_PER_ROUTER = 10;

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
  const routerFile = [];
  for (let procIndex = 0; procIndex < NUM_PROCEDURES_PER_ROUTER; procIndex++) {
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

  const contents = WRAPPER.replace('__CONTENT__', routerFile.join('\n'))
    .replace('__IMPORTS__', '')
    .replace('__ROUTER_NAME__', `router${routerIndex}`);
  fs.writeFileSync(SERVER_DIR + `/router${routerIndex}.ts`, contents);
}
const imports = new Array(NUM_ROUTERS)
  .fill('')
  .map((_, index) => `import { router${index} } from './router${index}';`)
  .join('\n');
const content = new Array(NUM_ROUTERS)
  .fill('')
  .map((_, index) => `...router${index}.queries,`)
  .join('\n');
let indexFile = WRAPPER.replace('__IMPORTS__', imports)
  .replace('__ROUTER_NAME__', `appRouter`)
  .replace('__CONTENT__', content);

fs.writeFileSync(SERVER_DIR + '/_app.ts', indexFile);
