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
 * @param {Object} options
 * @returns {String}
 */
module.exports = function (htmlpath, html, options) {
	options = options || {};

	// Parse inline sources
	var sources = parse(htmlpath, html);

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
function parse (htmlpath, html) {
	// Remove file name if necessary
	htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

	var sources = []
		, match;

	// Parse inline <script> tags
	while (match = RE_INLINE_SOURCE.exec(html)) {
		sources.push({
			context: match[1],
			filepath: getPath('js', match[1], htmlpath),
			type: 'js'
		});
	}

	// Parse inline <link> tags
	while (match = RE_INLINE_HREF.exec(html)) {
		sources.push({
			context: match[1],
			filepath: getPath('css', match[1], htmlpath),
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
function getPath (type, source, htmlpath) {
	var isCSS = (type == 'css')
		// Parse url
		, sourcepath = source.match(isCSS ? RE_HREF : RE_SRC)[1]
		, filepath = sourcepath.indexOf('/') == 0
			// Absolute
			? path.resolve(process.cwd(), sourcepath.slice(1))
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
			try {
				content = getContent(source.type, source.filepath);
			} catch (err) {
				// Remove 'inline' attribute if error loading content
				content = source.context.replace(' inline', '');
					// Compress if set
					if (options.compress) content = compressContent(type, content);
			}
			// Replace inlined content in html
			html = html.replace(source.context, content);
		});
	}

	return html;
}

/**
 * Retrieve content for 'source'
 * @param {String} type
 * @param {String} filepath
 * @returns {String}
 */
function getContent (type, filepath) {
	var isCSS = (type == 'css')
		, tag = isCSS ? 'style' : 'script'
		, content = fs.readFileSync(filepath, 'utf8');

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