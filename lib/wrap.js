var utils = require('./utils')

	, RE_BEGIN_LINE = /^./gm;

/**
 * Wrap source content
 * @param {Object} source
 * @param {Function} next(err)
 */
module.exports = function wrap (source, next) {
	if (source.content != null && !source.replace) {
		var attrs = utils.getAttributeString(source.attributes, source.parentContext.attribute, !source.errored)
				// inline tags are not closed
			, closing = (source.tag != 'link')
				? '</' + source.tag + '>'
				: ''
			, content = source.parentContext.pretty
				? '\n' + source.content.replace(RE_BEGIN_LINE, source.padding + '$&') + '\n' + source.padding
				: source.content;

		source.replace = '<'
			+ source.tag
			+ attrs
			+ '>'
			+ content
			+ closing;

		next();
	} else {
		next();
	}
};