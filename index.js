var path = require('path')
	, fs = require('fs')
	, uglify = require('uglify-js')
	, cleanCSS = require('clean-css')
	, RE_INLINE_SOURCE = /^\s*?(<script.*?\sinline.*?[^<]+<\/script>)/gm
	, RE_INLINE_HREF = /^\s*?(<link.*?\sinline[^>]*>)/gm
	, RE_SRC = /src=["|'](.+)["|']/
	, RE_HREF = /href=["|'](.+)["|']/;

/**
 * Parse 'html' for <script> and <link> tags containing an 'inline' attribute
 * @param {String} html
 */
module.exports = function(html) {
	var match;

	// Parse inline <script> tags
	while (match = RE_INLINE_SOURCE.exec(html)) {
		html = inline('js', match[1], html);
	}

	// Parse inline <link> tags
	while (match = RE_INLINE_HREF.exec(html)) {
		html = inline('css', match[1], html);
	}

	return html;
};

/**
 * Inline a 'source' tag in 'html'
 * @param {String} type
 * @param {String} source
 * @param {String} html
 * @returns {String}
 */
function inline(type, source, html) {
	var isCSS = (type == 'css')
		, tag = isCSS ? 'style' : 'script'
		, content = '<' + tag + '>'
		// Parse url
		, filepath = path.resolve(source.match(isCSS ? RE_HREF : RE_SRC)[1])
		, filecontent;

	if (fs.existsSync(filepath)) {
		filecontent = fs.readFileSync(filepath, 'utf8');
		// Compress
		try {
			filecontent = isCSS
				? cleanCSS.process(filecontent)
				: uglify.minify(filecontent, {fromString: true}).code;
		} catch (err) {
			return fn(err);
		}
		content += filecontent + '</' + tag + '>';
		// Inline
		return html.replace(source, content);
	} else {
		// Remove 'inline' attribute
		return html.replace(source, source.replace(' inline', ''))
	}
}