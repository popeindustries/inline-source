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
 *  - {Boolean} saveAsImage
 * @param {Function} fn(err, html)
 */
module.exports = function inlineSource (htmlpath, options, fn) {
  if ('function' == typeof options) {
    fn = options;
    options = {};
  }

  const ctx = context.create(options);
  const next = function (html) {
    ctx.html = html;
    parse(ctx, function (err) {
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
    ctx.fs.readFile(ctx.htmlpath, 'utf8', function (err, content) {
      if (err) return fn(err);
      next(content);
    });

  // Passed file content instead of path
  } else {
    next(htmlpath);
  }
};

/**
 * Synchronously inline sources found in 'htmlpath'
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
 *  - {Boolean} saveAsImage
 * @returns {String}
 */
module.exports.sync = function inlineSourceSync (htmlpath, options) {
  options = options || {};

  const ctx = context.create(options);

  // Load html content
  if (utils.isFilepath(htmlpath)) {
    ctx.htmlpath = path.resolve(htmlpath);
    ctx.html = ctx.fs.readFileSync(ctx.htmlpath, 'utf8');

  // Passed file content instead of path
  } else {
    ctx.html = htmlpath;
  }

  parse(ctx);

  return (ctx.sources.length)
    ? run(ctx, ctx.sources, ctx.swallowErrors)
    : ctx.html;
};
