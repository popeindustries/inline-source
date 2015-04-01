var load = require('./load')
	, merge = require('lodash/object/merge')
	, utils = require('./utils')

	, DEFAULT = {
			attribute: 'inline',
			compress: true,
			pretty: false,
			swallowErrors: true
		};

/**
 * Retrieve context from 'options'
 * @param {Object} options
 * @returns {Object}
 */
exports.create = function (options) {
	options = options || {};

	var context = merge({
		html: '',
		rootpath: process.cwd(),
		sources: []
	}, DEFAULT, options);

	if (options.rootpath) context.rootpath = path.resolve(options.rootpath);
	// if (options.inlineJS == null) options.inlineJS = true;
	// if (options.inlineCSS == null) options.inlineCSS = true;
	if (options.pretty == true && context.compress == false) context.pretty = true;
	context.re = utils.getTagRegExp(context.attribute);
	// Prepare stack
	context.stack = [load];
	if (context.handlers && Array.isArray(context.handlers)) context.stack = context.stack.concat(context.handlers);

	return context;
}
