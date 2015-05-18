'use strict';

var htmlparser = require('htmlparser2')
	, path = require('path')
	, utils = require('./utils')

	, RE_COMMENT = /(<!--[^[i][\S\s]+?--\s?>)/gm;

/**
 * Parse inlineable sources, modifying passed 'context'
 * @param {Object} context
 * @param {Function} [fn(err)]
 */
module.exports = function parse (context, fn) {
	fn = fn || utils.noop;

	var html = context.html.replace(RE_COMMENT, '')
			// This api uses a synchronous callback handler, so order and definition of 'match' is preserved
		, parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
				if (err) return fn(err);

				var parsed = dom[0]
					, attributes = utils.parseAttributes(parsed.attribs)
					, props = utils.parseProps(attributes, context.attribute)
					, tag = match[1]
					, type = utils.getTypeFromType(attributes.type) || utils.getTypeFromTag(match[1])
					, filepath = utils.getSourcepath(attributes.src || attributes.href, context.htmlpath, context.rootpath)
					, extension = path.extname(filepath).slice(1)
					, format = utils.getFormatFromExtension(extension);

				// Ignore based on tag or type
				if (!utils.isIgnored(context.ignore, tag, type, format)) {
					context.sources.push({
						attributes: attributes,
						compress: props.compress || context.compress,
						content: null,
						errored: false,
						extension: extension,
						fileContent: '',
						filepath: filepath,
						format: format,
						match: match[0],
						padding: context.pretty ? utils.getPadding(match[0], context.html) : '',
						parentContext: context,
						props: props,
						replace: '',
						stack: context.stack,
						tag: match[1],
						type: type
					});
				}
			}))
		, match;

	while (match = context.re.exec(html)) {
		parser.parseComplete(match);
	}

	fn();
};