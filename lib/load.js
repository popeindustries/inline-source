var fs = require('fs')

/**
 * Load content for 'source'
 * @param {Object} source
 * @param {Function} [next]
 */
module.exports = function load (source, next) {
	var sync = !next;

	if (!source.content) {
		if (!sync) {
			fs.readFile(source.filepath, 'utf8', function (err, content) {
				if (err) return next(err);
				source.content = content;
				return next();
			});
		} else {
			source.content = fs.readFileSync(source.filepath, 'utf8');
		}
	}
};