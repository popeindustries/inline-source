var css = require('./css')
	, inline = require('./inline')
	, js = require('./js')
	, load = require('./load')
	, merge = require('lodash/object/merge')
	, path = require('path')
	, utils = require('./utils')
	, wrap = require('./wrap')

	, DEFAULT = {
			attribute: 'inline',
			compress: true,
			pretty: false,
			swallowErrors: false
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
	if (options.handlers) context.stack = context.stack.concat(options.handlers);
	context.stack.push(js, css, wrap, inline);

	return context;
}
