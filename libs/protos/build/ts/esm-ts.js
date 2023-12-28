import { glob } from "glob";
import fs from "fs";
import path from 'path';

const files = await glob("./protos/**/*.ts")

//
// Add .ts to imports so they are esm compliant (deno requires this)
files.forEach(file => {
  const denoDir = `./deno/${path.dirname(file)}`;
  const nodedir = `./node/esm/${path.dirname(file)}`;
  const content = fs.readFileSync(file, 'utf-8')
    .split('\n').map(s => s.replace(/^(import .+? from ["']\..+?)(["'];)$/, '$1.ts$2'))
    .join('\n');

  if (!fs.existsSync(nodedir)){
    fs.mkdirSync(nodedir, { recursive: true });
  }

  if (!fs.existsSync(denoDir)){
    fs.mkdirSync(denoDir, { recursive: true });
  }

  //
  // move from /protos to /deno/protos
  fs.writeFileSync(`./deno/${file}`, content, 'utf-8')
  fs.writeFileSync(`./node/esm/${file}`, content, 'utf-8')
});
