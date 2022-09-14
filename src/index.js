import { isFilepath } from './utils.js';
import { createContext } from './context.js';
import path from 'path';
import { parse } from './parse.js';
import { run } from './run.js';

/**
 * Inline sources found in 'htmlpath'
 * @param { string } htmlpath
 * @param { Options } options
 * @returns { Promise<string> }
 */
export async function inlineSource(htmlpath, options = {}) {
  const ctx = createContext(options);

  // Load html content
  if (isFilepath(htmlpath)) {
    ctx.htmlpath = path.resolve(htmlpath);
    ctx.html = ctx.fs.readFileSync(ctx.htmlpath, 'utf8');
    // Passed file content instead of path
  } else {
    ctx.html = htmlpath;
  }

  await parse(ctx);

  if (ctx.sources.length > 0) {
    await run(ctx, ctx.sources, ctx.swallowErrors);
  }

  return ctx.html;
}
