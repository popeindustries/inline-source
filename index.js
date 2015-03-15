var context = require('./lib/context')
	, fs = require('fs')
	, path = require('path')
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
					inline(ctx, fn);
				});
			};

	if (utils.isFilepath(htmlpath)) {
		ctx.htmlpath = htmlpath;
		fs.readFile(html, 'utf8', function (err, content) {
			if (err) return fn(err);
			next(content);
		});
	// Already loaded
	} else {
		next(htmlpath);
	}
};

/**
 *
 * @param {String} htmlpath
 * @param {Object} options
 * @returns {String}
 */
module.exports.sync = function inlineSourceSync (htmlpath, options) {
	var ctx = context.create(options);

	if (utils.isFilepath(htmlpath)) {
		ctx.htmlpath = htmlpath;
		ctx.html = fs.readFileSync(htmlpath, 'utf8');
	} else {
		ctx.html = htmlpath;
	}

	parse(ctx);
	return inline(ctx);
};