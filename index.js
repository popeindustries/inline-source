var context = require('./lib/context')
	, fs = require('fs')
	, path = require('path')
	, parse = require('./lib/parse')
	, run = require('./lib/run')
	, utils = require('./lib/utils');

/**
 *
 * @param {String} htmlpath
 * @param {Object} options
 * @param {Function} fn(err, html)
 */
module.exports = function inlineSource (htmlpath, options, fn) {
	if ('function' == typeof options) {
		fn = options;
		options = {};
	}

	var ctx = context.create(options)
		, next = function (html) {
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
		context.htmlpath = path.resolve(htmlpath);
		fs.readFile(context.htmlpath, 'utf8', function (err, content) {
			if (err) return fn(err);
			next(content);
		});
	// Passed file content instead of path
	} else {
		next(htmlpath);
	}
};