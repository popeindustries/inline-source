'use strict';

const context = require('./lib/context');
const path = require('path');
const parse = require('./lib/parse');
const run = require('./lib/run');
const utils = require('./lib/utils');

/**
 * Inline sources found in 'htmlpath'
 * @param {String} htmlpath
 * @param {Object} options
 *  - {String} attribute
 *  - {Boolean} compress
 *  - {Object} fs
 *  - {Array} handlers
 *  - {Array} ignore
 *  - {Boolean} pretty
 *  - {String} rootpath
 *  - {Boolean} swallowErrors
 *  - {Boolean} svgAsImage
 * @param {Function} [fn]
 * @returns {Promise}
 */
exports.inlineSource = function inlineSource(htmlpath, options, fn) {
  let asPromise = false;

  if ('function' == typeof options) {
    fn = options;
    options = {};
  }
  if (fn === undefined) {
    asPromise = true;
  }

  const ctx = context.create(options);
  const next = function(html) {
    ctx.html = html;
    parse(ctx, function(err) {
      if (err) return fn(err);
      if (ctx.sources.length) {
        run(ctx, ctx.sources, ctx.swallowErrors, fn);
      } else {
        return fn(null, ctx.html);
      }
    });
  };

  // Load html content
  if (utils.isFilepath(htmlpath)) {
    ctx.htmlpath = path.resolve(htmlpath);
    ctx.fs.readFile(ctx.htmlpath, 'utf8', function(err, content) {
      if (err) return fn(err);
      next(content);
    });

    // Passed file content instead of path
  } else {
    next(htmlpath);
  }
};

async function parseAndRun(html, ctx) {
  ctx.html = html;

  await parse(ctx);

  if (ctx.sources.length > 0) {
    await run(ctx, ctx.sources, ctx.swallowErrors);
  }

  return ctx.html;
}
