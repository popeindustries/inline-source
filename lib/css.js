var csso = require('csso');

/**
 * Handle CSS content
 * @param {Object} source
 * @param {Function} next(err)
 */
module.exports = function css (source, next) {
	if (source.filecontent
		&& !source.content
		&& (source.type == 'css')) {
			try {
				source.content = source.compress
					? csso.justDoIt(source.filecontent)
					: source.filecontent;
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