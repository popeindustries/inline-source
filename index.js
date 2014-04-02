var path = require('path')
	, fs = require('fs')
	, uglify = require('uglify-js')
	, csso = require('csso')

	, RE_INLINE_SOURCE = /^\s*?(<script.*?\sinline.*?[^<]+<\/script>)/gm
	, RE_INLINE_HREF = /^\s*?(<link.*?\sinline[^>]*>)/gm
	, RE_SRC = /src=["|'](.+)["|']/
	, RE_HREF = /href=["|'](.+)["|']/;

/**
 * Parse 'html' for <script> and <link> tags containing an 'inline' attribute
 * @param {String} htmlpath
 * @param {String} html
 */
module.exports = function (htmlpath, html) {
	var match;

	// Remove file name if necessary
	htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

	// Parse inline <script> tags
	while (match = RE_INLINE_SOURCE.exec(html)) {
		html = inline('js', match[1], htmlpath, html);
	}

	// Parse inline <link> tags
	while (match = RE_INLINE_HREF.exec(html)) {
		html = inline('css', match[1], htmlpath, html);
	}

	return html;
};

/**
 * Inline a 'source' tag in 'html'
 * @param {String} type
 * @param {String} source
 * @param {String} htmlpath
 * @param {String} html
 * @returns {String}
 */
function inline (type, source, htmlpath, html) {
	var isCSS = (type == 'css')
		, tag = isCSS ? 'style' : 'script'
		, content = '<' + tag + '>'
		// Parse url
		, sourcepath = source.match(isCSS ? RE_HREF : RE_SRC)[1]
		, filepath = sourcepath.indexOf('/') == 0
			// Absolute
			? path.resolve(process.cwd(), sourcepath.slice(1))
			// Relative
			: path.resolve(htmlpath, sourcepath)
		, filecontent;

	if (fs.existsSync(filepath)) {
		filecontent = fs.readFileSync(filepath, 'utf8');
		// Compress
		try {
			filecontent = isCSS
				? csso.justDoIt(filecontent)
				: uglify.minify(filecontent, {fromString: true}).code;
		} catch (err) { }
		content += filecontent + '</' + tag + '>';
		// Inline
		return html.replace(source, content);
	} else {
		// Remove 'inline' attribute
		return html.replace(source, source.replace(' inline', ''))
	}
}