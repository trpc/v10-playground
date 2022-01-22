import fs from 'fs';
import path from 'path';

const NUM_FILES_TO_GENERATE = 200;
const NUM_PROCEDURES_TO_GENERATE = 10;

const CONTENTS = `
/* eslint-disable */
import * as trpc from '../../src';

export const bigRouter = ${getBFR()}
  .flat();
`.trim();

// Big F̶u̶c̶ Fantastic Router
function getBFR() {
  const serverDir = __dirname + '/../.big/server';
  for (let fileIndex = 0; fileIndex < NUM_FILES_TO_GENERATE; fileIndex++) {
    const prefixContent = `
import { createRouter, resolver } from '../context';

`.trim();
    const file = [prefixContent];
    for (
      let procIndex = 0;
      procIndex < NUM_PROCEDURES_TO_GENERATE;
      procIndex++
    ) {
      file.push([''].join('\n'));
    }
    const contents = file.join('\n  ');
  }
}

const dir = path.join(
  __dirname,
  '..',
  'packages',
  'server',
  'test',
  '__generated__',
);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'bigRouter.ts'), CONTENTS);
