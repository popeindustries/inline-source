var merge = require('lodash/object/merge')

	, DEFAULT = {
			attribute: 'inline',
			compress: true,
			pretty: false,
			swallowErrors: true
		};

/**
 * Configure 'options'
 * @param {Object} options
 */
exports.create = function (options) {
	var context = merge({
		html: '',
		htmlpath: '',
		sources: []
	}, DEFAULT, options);

	context.rootpath = options.rootpath
		? path.resolve(options.rootpath)
		: process.cwd();
	// if (options.inlineJS == null) options.inlineJS = true;
	// if (options.inlineCSS == null) options.inlineCSS = true;
	if (options.pretty == true && context.compress == false) context.pretty = true;
	context.reInlineSource = new RegExp('(<script.*?\\s' + context.attribute + '.*?[^<]+<\\/script>)', 'gm');
	context.reInlineHref = new RegExp('(<link.*?\\s' + context.attribute + '[^>]*>)', 'gm');
	// Prepare stack
	context.stack = [require('./load')];
	if (context.handlers) context.stack = context.stack.concat(context.handlers);

	return context;
}
