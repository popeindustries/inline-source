var path = require('path')
	, utils = require('./utils');

/**
 * Parse inlineable sources
 * @param {Object} context
 * @param {Function} [fn]
 */
module.exports = function parse (context, fn) {
	var dir = path.dirname(context.htmlpath)
		, match;

	var getSource = function (type, match) {
		return {
			match: match,
			filepath: utils.getSourcepath(type, match, context.htmlpath, context.rootpath),
			type: type,
			padding: context.pretty ? utils.getPadding(context, html) : ''
		}
	}

	// Parse inline <script> tags
	while (match = context.reInlineSource.exec(html)) {
		context.sources.push(getSource('js', match[1]));
	}

	// Parse inline <link> tags
	while (match = context.reInlineHref.exec(html)) {
		context.sources.push(getSource('css', match[1]));
	}

	if (fn) return fn();
	return;
}