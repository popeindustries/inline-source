var fs = require('fs')

/**
 * Load content for 'source'
 * @param {Object} source
 * @param {Function} next(err)
 */
module.exports = function load (source, next) {
	if (!source.content) {
		fs.readFile(source.filepath, 'utf8', function (err, content) {
			if (err) return next(err);
			source.content = content;
			return next();
		});
	}
};