var fs = require('fs')

/**
 * Load content for 'source'
 * @param {Object} source
 * @param {Object} context
 * @param {Function} next(err)
 */
module.exports = function load (source, context, next) {
	if (!source.fileContent && source.filepath) {
		fs.readFile(source.filepath, 'utf8', function (err, content) {
			if (err) return next(err);
			source.fileContent = content;
			return next();
		});
	} else {
		next();
	}
};