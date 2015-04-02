var htmlparser = require('htmlparser2')
	, path = require('path')
	, utils = require('./utils');

/**
 * Parse inlineable sources
 * @param {Object} context
 * @param {Function} fn(err)
 */
module.exports = function parse (context, fn) {
	var match
		, parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
				if (err) return fn(err);

				var parsed = dom[0]
					, attributes = parsed.attribs
					, type = utils.getTypeFromType(attributes.type) || utils.getTypeFromTag(match[1]);

				context.sources.push({
					attributes: attributes,
					filepath: utils.getSourcepath(attributes.src || attributes.href, context.rootpath),
					match: match[0],
					padding: context.pretty ? utils.getPadding(match, context.html) : '',
					tag: match[1],
					type: type
				});
			}));

	// TODO: remove comments

	while (match = context.re.exec(context.html)) {
		parser.parseComplete(match);
	}

	fn();
};