var path = require('path')
	, fs = require('fs')
	, uglify = require('uglify-js')
	, csso = require('csso')

	, RE_SRC = /src=["|'](.+?)["|']/
	, RE_HREF = /href=["|'](.+?)["|']/;

/**
 * Synchronously parse 'html' for <script> and <link> tags containing an 'inline' attribute,
 * and replace with compressed file contents
 * @param {String} htmlpath
 * @param {String} [html]
 * @param {Object} options  [compress:true, swallowErrors:true, rootpath:'']
 * @returns {String}
 */
module.exports = function (htmlpath, html, options) {
	var arity = arguments.length;
	if (arity == 1) {
		html = '';
		options = {};
	} else if (arity == 2) {
		if ('object' == typeof html) {
			options = html;
			html = '';
		} else {
			options = {};
		}
	}

	options = config(options);

	if (!html) {
		try {
			html = fs.readFileSync(htmlpath, 'utf8');
		} catch (err) {
			if (!options.swallowErrors) throw err;
			return;
		}
	}

	// Parse inline sources
	var sources = parse(htmlpath, html, options);

	// Inline
	return inline(sources, html, options);
};

// Expose steps
module.exports.parse = parse;
module.exports.inline = inline;

/**
 * Configure 'options'
 * @param {Object} options
 * @returns {Object}
 */
function config (options) {
	if (!options || !options.config) {
		options = options || {};
		if (options.compress == null) options.compress = true;
		if (options.swallowErrors == null) options.swallowErrors = true;
		if (options.attribute == null) options.attribute = 'inline';
		options.rootpath = options.rootpath
			? path.resolve(options.rootpath)
			: process.cwd();
		if (options.inlineJS == null) options.inlineJS = true;
		if (options.inlineCSS == null) options.inlineCSS = true;
		if (options.pretty == null || options.pretty == true && options.compress == true) options.pretty = false;
		options.reInlineSource = new RegExp('^\\s*?(<script.*?\\s' + options.attribute + '.*?[^<]+<\\/script>)', 'gm');
		options.reInlineHref = new RegExp('^\\s*?(<link.*?\\s' + options.attribute + '[^>]*>)', 'gm');
		options.config = true;
	}

	return options;
}

/**
 * Parse 'html' for inlineable sources
 * @param {String} htmlpath
 * @param {String} html
 * @param {Object} options
 * @returns {Array}
 */
function parse (htmlpath, html, options) {
	// In case this is entry point, configure
	options = config(options);

	// Remove file name if necessary
	htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

	var sources = []
		, match;

	var getSource = function (type, context) {
		return {
			context: context,
			filepath: getPath(type, context, htmlpath, options.rootpath),
			inline: (type == 'js') ? options.inlineJS : options.inlineCSS,
			type: type,
			padding: options.pretty ? getPadding(context, html) : ''
		}
	}

	// Parse inline <script> tags
	while (match = options.reInlineSource.exec(html)) {
		sources.push(getSource('js', match[1]));
	}

	// Parse inline <link> tags
	while (match = options.reInlineHref.exec(html)) {
		sources.push(getSource('css', match[1]));
	}

	return sources;
}

/**
 * Retrieve filepath for 'source'
 * @param {String} type
 * @param {String} source
 * @param {String} htmlpath
 * @param {String} rootpath
 * @returns {String}
 */
function getPath (type, source, htmlpath, rootpath) {
	var isCSS = (type == 'css')
		// Parse url
		, sourcepath = source.match(isCSS ? RE_HREF : RE_SRC)[1]
		, filepath = sourcepath.indexOf('/') == 0
			// Absolute
			? path.resolve(rootpath, sourcepath.slice(1))
			// Relative
			: path.resolve(htmlpath, sourcepath);

	return filepath;
}

/**
 * Retrieve leading whitespace for 'source' in 'html'
 * @param {String} source
 * @param {String} html
 * @returns {String}
 */
function getPadding (source, html) {
	var re = new RegExp('^([\\t ]+)' + escape(source), 'gm')
		, match = re.exec(html);

	return match ? match[1] : '';
}

/**
 * Inline 'sources' into 'html'
 * @param {Array} source
 * @param {String} html
 * @param {Object} options
 * @returns {String}
 */
function inline (sources, html, options) {
	// In case this is entry point, configure
	options = config(options);

	var type, content;

	if (sources.length) {
		sources.forEach(function (source) {
			if (source.inline) {
				type = source.type;
				try {
					// Read from File instance if passed
					// (popeindustries/buddy optimization)
					content = source.instance
						? source.instance.content
						: fs.readFileSync(source.filepath, 'utf8');
					// Compress if set
					if (options.compress) content = compressContent(type, content);
					content = wrapContent(type, content, {
						padding: source.padding,
						pretty: options.pretty
					});
				} catch (err) {
					if (!options.swallowErrors) throw err;
					// Remove 'inline' attribute if error loading content
					content = source.context.replace(' ' + options.attribute, '');
				}
			// Disabled via options.inlineXX
			} else {
				content = source.context;
			}

			// Replace inlined content in html (PR #5)
			html = html.replace(source.context, function () { return content; });
		});
	}

	return html;
}

/**
 * Wrap 'content' in appropriate tag based on 'type'
 * @param {String} type
 * @param {String} content
 * @param {Object} options
 * @returns {String}
 */
function wrapContent (type, content, options) {
	var tag = (type == 'css')
		? 'style'
		: 'script';

	// Indent lines if 'pretty'
	content = options.pretty
		? '\n' + content.replace(/^./gm, options.padding + '$&') + '\n' + options.padding
		: content;

	return '<' + tag + '>'
		+ content
		+ '</' + tag + '>';
}

/**
 * Compress 'content' of 'type'
 * @param {String} type
 * @param {String} content
 * @returns {String}
 */
function compressContent (type, content) {
	try {
		content = (type == 'css')
			? csso.justDoIt(content)
			: uglify.minify(content, {fromString: true}).code;
	} catch (err) { /* return uncompressed if error */ }

	return content;
}

/**
 * Escape 'str' for use in RegExp constructor
 * @param {String} str
 * @returns {String}
 */
 function escape (str) {
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};