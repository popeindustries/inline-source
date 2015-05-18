'use strict';

var utils = require('./utils')

	, RE_BEGIN_LINE = /^./gm;

/**
 * Wrap source content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 */
module.exports = function wrap (source, context, next) {
	if (source.content != null && !source.replace) {
		var attrs = utils.getAttributeString(source.attributes, context.attribute, !source.errored)
				// link tags are not closed
			, closing = (source.tag != 'link')
				? '</' + source.tag + '>'
				: ''
			, content = context.pretty
				? '\n' + source.content.replace(RE_BEGIN_LINE, source.padding + '$&') + '\n' + source.padding
				: source.content;

		source.replace = '<'
			+ source.tag
			+ attrs
			+ '>'
			+ content
			+ closing;
	}

	if (next) next();
};