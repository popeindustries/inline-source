var uglify = require('uglify-js');

/**
 * Handle JavaScript content
 * @param {Object} source
 * @param {Function} next(err)
 */
module.exports = function js (source, next) {
	if (source.filecontent
		&& !source.content
		&& (source.type == 'js')) {
			try {
				source.content = source.compress
					? uglify.minify(source.filecontent, { fromString: true }).code
					: source.filecontent;
				next();
			} catch (err) {
				return next(err);
			}
	} else {
		next();
	}
};