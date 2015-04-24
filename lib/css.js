var csso = require('csso');

/**
 * Handle CSS content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} next(err)
 */
module.exports = function css (source, context, next) {
	if (source.fileContent
		&& !source.content
		&& (source.type == 'css')) {
			try {
				source.content = source.compress
					? csso.justDoIt(source.fileContent)
					: source.fileContent;
				// Change tag type
				source.tag = 'style';
				next();
			} catch (err) {
				return next(err);
			}
	} else {
		next();
	}
};