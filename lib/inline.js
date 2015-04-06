var utils = require('./utils');

/**
 * Inline source content
 * @param {Object} source
 * @param {Function} next(err)
 */
module.exports = function inline (source, next) {
	if (source.replace) {
		source.parentContext.html =
			// Fix for PR#5
			source.parentContext.html.replace(source.match, function () { return source.replace; });

		next();
	} else {
		next();
	}
};