var utils = require('./utils');

/**
 * Wrap source content
 * @param {Object} source
 * @param {Function} next(err)
 */
module.exports = function wrap (source, next) {
	if (source.content && !source.replace) {
		var attrs = utils.getAttributeString(source.attributes, source.parentContext.attribute);

		source.replace = '<' + source.tag + attrs + '>'
			+ source.content
			+ '</' + source.tag + '>';

		next();
	} else {
		next();
	}
};