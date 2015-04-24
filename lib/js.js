var uglify = require('uglify-js');

/**
 * Handle JavaScript content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} next(err)
 */
module.exports = function js (source, context, next) {
	if (source.fileContent
		&& !source.content
		&& (source.type == 'js')) {
			try {
				source.content = source.compress
					? uglify.minify(source.fileContent, { fromString: true }).code
					: source.fileContent;
				next();
			} catch (err) {
				return next(err);
			}
	} else {
		next();
	}
};