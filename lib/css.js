'use strict';

var csso = require('csso')
	, noop = require('./utils').noop;

/**
 * Handle CSS content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next(err)]
 */
module.exports = function css (source, context, next) {
	// Handle sync
	next = next || noop;

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