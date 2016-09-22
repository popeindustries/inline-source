'use strict';

var context = require('./lib/context');
var path = require('path');
var parse = require('./lib/parse');
var run = require('./lib/run');
var utils = require('./lib/utils');

/**
 * Inline sources found in 'htmlpath'
 * @param {String} htmlpath
 * @param {Object} options
 * @param {Function} fn(err, html)
 */
module.exports = function inlineSource (htmlpath, options, fn) {
  if ('function' == typeof options) {
    fn = options;
    options = {};
  }
  //compatible memory fs
  var fs = options.fs || require('fs');

  var ctx = context.create(options);
  var next = function (html) {
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

  if (utils.isFilepath(htmlpath)) {
    ctx.htmlpath = path.resolve(htmlpath);
    fs.readFile(ctx.htmlpath, 'utf8', function (err, content) {
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
 * @returns {String}
 */
module.exports.sync = function inlineSourceSync (htmlpath, options) {
  options = options || {};
  
  //compatible memory fs
  var fs = options.fs || require('fs');

  var ctx = context.create(options);

  if (utils.isFilepath(htmlpath)) {
    ctx.htmlpath = path.resolve(htmlpath);
    ctx.html = fs.readFileSync(ctx.htmlpath, 'utf8');

  // Passed file content instead of path
  } else {
    ctx.html = htmlpath;
  }

  parse(ctx);

  return (ctx.sources.length)
    ? run(ctx, ctx.sources, ctx.swallowErrors)
    : ctx.html;
};
