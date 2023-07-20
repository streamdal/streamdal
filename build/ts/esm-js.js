import { glob } from "glob";
import fs from "fs";
import path from 'path';

const files = await glob("./protos/node/**/*.ts")

//
// Add .js to imports so they are esm compliant
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8')
    .split('\n').map(s => s.replace(/^(import .+? from ["']\..+?)(["'];)$/, '$1.js$2'))
    .join('\n');

  fs.writeFileSync(file, content, 'utf-8')
});