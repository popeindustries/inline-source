'use strict';

var Svgo = require('svgo')
	, utils = require('./utils')

	, RE_XML_TAG = /<\?xml.+?\?>\s+/

	, svgo = new Svgo();

/**
 * Handle IMG content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next(err)]
 */
module.exports = function css (source, context, next) {
	// Handle sync
	next = next || utils.noop;

	if (source.fileContent
		&& !source.content
		&& (source.type == 'image')) {
			var attrs = utils.getAttributeString(source.attributes, context.attribute, !source.errored)
				, data, encoding, src;

			// svg
			if (source.format == 'svg+xml') {
				// Strip xml tag
				source.content = source.fileContent.replace(RE_XML_TAG, '');
				if (source.compress) {
					// Sync api call
					svgo.optimize(source.fileContent, function (content) {
						source.content = content.data;
					});
				}

				// Inline svg tag
				if (!context.svgAsImage) {
					source.replace = source.content;
					return next();
				} else {
					data = encodeURIComponent(source.content);
					encoding = 'utf8';
				}

			// gif/png/jpeg
			} else {
				data = new Buffer(source.fileContent).toString('base64');
				encoding = 'base64';
			}

			src = 'data:image/' + source.format + ';' + encoding + ',' + data;

			attrs += ' src="' + src + '"';
			source.content = src;
			source.replace = '<'
				+ source.tag
				+ attrs
				+ ' />';

			next();
	} else {
		next();
	}
};