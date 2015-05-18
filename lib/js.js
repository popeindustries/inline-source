'use strict';

var noop = require('./utils').noop
	, uglify = require('uglify-js')

	, RE_SCRIPT = /(<)(\/script>)/g;

/**
 * Handle JavaScript content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next(err)]
 */
module.exports = function js (source, context, next) {
	// Handle sync
	next = next || noop;

	if (source.fileContent
		&& !source.content
		&& (source.type == 'js')) {
			try {
				// Escape closing </script>
				if (RE_SCRIPT.test(source.fileContent)) {
					source.fileContent = source.fileContent.replace(RE_SCRIPT, '\x3C$2');
				}

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