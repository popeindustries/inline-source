'use strict';

var htmlparser = require('htmlparser2')
	, merge = require('lodash/object/merge')
	, Svgo = require('svgo')
	, utils = require('./utils')

	, DEFAULT_SVG_ATTR = {
			x: '0',
			y: '0',
			viewBox: '0 0 100 100'
		}
	, RE_SVG_CONTENT = /<svg[^>]+>([\S\s]*?)<\/\s?svg>/gm
	, RE_XML_TAG = /<\?xml.+?\?>\s+/g

	, svgo = new Svgo();

/**
 * Handle IMG content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next(err)]
 * @returns {null}
 */
module.exports = function img (source, context, next) {
	// Handle sync
	next = next || utils.noop;

	if (source.fileContent
		&& !source.content
		&& (source.type == 'image')) {
			var data, encoding, src;

			delete source.attributes.type;

			// svg
			if (source.format == 'svg+xml') {
				if (!source.svgAsImage) {
					RE_SVG_CONTENT.lastIndex = 0;

					var attributes = {}
						, match = RE_SVG_CONTENT.exec(source.fileContent)
						, parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
								if (err) return next(err);

								dom = dom.filter(function (item) {
									return (item.type == 'tag' && item.name == 'svg');
								});

								if (dom.length) {
									attributes = utils.parseAttributes(dom[0].attribs);
									// Fix lowercasing
									if ('viewbox' in attributes) {
										attributes.viewBox = attributes.viewbox;
										delete attributes.viewbox;
									}
								}
							}));

					// Strip xml tag
					parser.parseComplete(source.fileContent);
					source.content = match ? match[1] : source.fileContent;
					source.attributes = merge({}, DEFAULT_SVG_ATTR, attributes, source.attributes);
					source.tag = 'svg';
					if (source.compress) {
						// Sync api call
						svgo.optimize(source.content, function (content) {
							source.content = content.data;
						});
					}
					return next();
				} else {
					source.tag = 'img';
					// Strip xml tag
					source.content = source.fileContent.replace(RE_XML_TAG, '');
					if (source.compress) {
						// Sync api call
						svgo.optimize(source.content, function (content) {
							source.content = content.data;
						});
					}
					data = encodeURIComponent(source.content);
					encoding = 'utf8';
				}

			// gif/png/jpeg
			} else {
				data = new Buffer(source.fileContent).toString('base64');
				encoding = 'base64';
			}

			var attrs = utils.getAttributeString(source.attributes, context.attribute, !source.errored);

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