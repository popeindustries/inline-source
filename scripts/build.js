import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

await esbuild.build({
  bundle: true,
  entryPoints: ['./src/index.js'],
  external: ['csso', 'svgo', 'htmlparser2', 'terser', 'node-fetch'],
  format: 'esm',
  target: 'node16',
  platform: 'node',
  outfile: 'index.js',
});

const types = fs
  .readFileSync(path.resolve('src/types.d.ts'), 'utf8')
  .replace(/(declare) (interface|type)/g, 'export $2');

fs.writeFileSync(
  path.resolve('index.d.ts'),
  `${types}\n${fs.readFileSync(path.resolve('src/index.d.ts'), 'utf8')}`
);
