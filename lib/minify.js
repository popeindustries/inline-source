var csso = require('csso')
	, uglify = require('uglify-js');

/**
 * Minify 'source' content
 * @param {Object} source
 * @param {Function} next(err)
 */
module.exports = function minify (source, next) {
	if (source.content
		&& (source.type == 'js' || source.type == 'css')) {
			try {
				source.content = (source.type == 'css')
					? csso.justDoIt(source.content)
					: uglify.minify(source.content, { fromString: true }).code;
				next();
			} catch (err) {
				return next(err);
			}
	} else {
		next();
	}
};