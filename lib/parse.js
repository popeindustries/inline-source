var htmlparser = require('htmlparser2')
	, path = require('path')
	, utils = require('./utils')

	, RE_COMMENT = /(<!--[\S\s]+?--\s?>)/gm;

/**
 * Parse inlineable sources
 * @param {Object} context
 * @param {Function} fn(err)
 */
module.exports = function parse (context, fn) {
	var html = context.html.replace(RE_COMMENT, '')
		, parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
				if (err) return fn(err);

				var parsed = dom[0]
					, attributes = utils.parseAttributes(parsed.attribs)
					, props = utils.parseProps(attributes, context.attribute)
					, type = utils.getTypeFromType(attributes.type) || utils.getTypeFromTag(match[1]);

				context.sources.push({
					attributes: attributes,
					compress: props.compress || context.compress,
					content: '',
					errored: false,
					filecontent: '',
					filepath: utils.getSourcepath(attributes.src || attributes.href, context.rootpath),
					match: match[0],
					padding: context.pretty ? utils.getPadding(match[0], context.html) : '',
					parentContext: context,
					props: props,
					replace: '',
					stack: context.stack,
					tag: match[1],
					type: type
				});
			}))
		, match;

	while (match = context.re.exec(html)) {
		parser.parseComplete(match);
	}

	fn();
};