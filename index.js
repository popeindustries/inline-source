var path = require('path')
	, fs = require('fs')
	, uglify = require('uglify-js')
	, csso = require('csso')

	, RE_INLINE_SOURCE = /^\s*?(<script.*?\sinline.*?[^<]+<\/script>)/gm
	, RE_INLINE_HREF = /^\s*?(<link.*?\sinline[^>]*>)/gm
	, RE_SRC = /src=["|'](.+)["|']/
	, RE_HREF = /href=["|'](.+)["|']/;

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
	if (options.compress == null) options.compress = true;
	if (options.swallowErrors == null) options.swallowErrors = true;
	options.rootpath = options.rootpath
		? path.resolve(options.rootpath)
		: process.cwd();

	if (!html) {
		try {
			html = fs.readFileSync(htmlpath, 'utf8');
		} catch (err) {
			if (!options.swallowErrors) throw err;
			return;
		}
	}

	// Parse inline sources
	var sources = parse(htmlpath, html, options.rootpath);

	// Inline
	return inline(sources, html, options);
};

// Expose steps
module.exports.parse = parse;
module.exports.inline = inline;

/**
 * Parse 'html' for inlineable sources
 * @param {String} htmlpath
 * @param {String} html
 * @param {String} rootpath
 * @returns {Array}
 */
function parse (htmlpath, html, rootpath) {
	// Remove file name if necessary
	htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

	var sources = []
		, match;

	var getSource = function (type, context) {
		return {
			context: context,
			filepath: getPath(type, match[1], htmlpath, rootpath),
			inline: true,
			type: type
		}
	}

	// Parse inline <script> tags
	while (match = RE_INLINE_SOURCE.exec(html)) {
		sources.push(getSource('js', match[1]));
	}

	// Parse inline <link> tags
	while (match = RE_INLINE_HREF.exec(html)) {
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
 * Inline 'sources' into 'html'
 * @param {Array} source
 * @param {String} html
 * @param {Object} options
 * @returns {String}
 */
function inline (sources, html, options) {
	options = options || {};

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
					content = wrapContent(type, content);
				} catch (err) {
					if (!options.swallowErrors) throw err;
					// Remove 'inline' attribute if error loading content
					content = source.context.replace(' inline', '');
				}
				// Replace inlined content in html
				html = html.replace(source.context, content);
			}
		});
	}

	return html;
}

/**
 * Wrap 'content' in appropriate tag based on 'type'
 * @param {String} type
 * @param {String} content
 * @returns {String}
 */
function wrapContent (type, content) {
	var tag = (type == 'css')
				? 'style'
				: 'script';

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