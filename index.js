'use strict';

const { isFilepath } = require('./lib/utils');
const context = require('./lib/context');
const path = require('path');
const parse = require('./lib/parse');
const run = require('./lib/run');

/**
 * Inline sources found in 'htmlpath'
 * @param { string } htmlpath
 * @param { object } options
 * @returns { Promise<string> }
 */
exports.inlineSource = async function inlineSource(htmlpath, options = {}) {
  const ctx = context.create(options);

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
};
