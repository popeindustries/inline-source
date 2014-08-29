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
 * @param {String} html
 * @param {Object} options  [compress:true, swallowErrors:true]
 * @returns {String}
 */
module.exports = function (htmlpath, html, options) {
	options = options || {};
	if (options.compress == null) options.compress = true;
	if (options.swallowErrors == null) options.swallowErrors = true;

	// Parse inline sources
	var sources = parse(htmlpath, html, options.absoluteBasePath || '');

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
 * @returns {Array}
 */
function parse (htmlpath, html, absolutebasepath) {
	// Remove file name if necessary
	htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

	var sources = []
		, match;

	// Parse inline <script> tags
	while (match = RE_INLINE_SOURCE.exec(html)) {
		sources.push({
			context: match[1],
			filepath: getPath('js', match[1], htmlpath, absolutebasepath),
			inline: true,
			type: 'js'
		});
	}

	// Parse inline <link> tags
	while (match = RE_INLINE_HREF.exec(html)) {
		sources.push({
			context: match[1],
			filepath: getPath('css', match[1], htmlpath, absolutebasepath),
			inline: true,
			type: 'css'
		});
	}

	return sources;
}

/**
 * Retrieve filepath for 'source'
 * @param {String} type
 * @param {String} source
 * @param {String} htmlpath
 * @returns {String}
 */
function getPath (type, source, htmlpath, absolutebasepath) {
	var isCSS = (type == 'css')
		// Parse url
		, sourcepath = source.match(isCSS ? RE_HREF : RE_SRC)[1]
		, filepath = sourcepath.indexOf('/') == 0
			// Absolute
			? path.resolve(process.cwd(), absolutebasepath, sourcepath.slice(1))
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