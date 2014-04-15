var path = require('path')
	, fs = require('fs')
	, co = require('co')
	, thunkify = require('thunkify')
	, readFile = thunkify(fs.readFile)
	, readFileSync = fs.readFileSync
	, uglify = require('uglify-js')
	, csso = require('csso')

	, RE_INLINE_SOURCE = /^\s*?(<script.*?\sinline.*?[^<]+<\/script>)/gm
	, RE_INLINE_HREF = /^\s*?(<link.*?\sinline[^>]*>)/gm
	, RE_SRC = /src=["|'](.+)["|']/
	, RE_HREF = /href=["|'](.+)["|']/;

/**
 * Parse 'html' for <script> and <link> tags containing an 'inline' attribute,
 * and replace with compressed file contents
 * @param {String} htmlpath
 * @param {String} html
 * @param {Function} fn(err, html)
 */
module.exports = function (htmlpath, html, fn) {
	co(function* (htmlpath, html) {
		try {
			// Parse inline sources
			var sources = parse(html)
				, source, filepath, content;

			// Remove file name if necessary
			htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

			if (sources.length) {
				// Get inlined content
				for (var i = 0, n = sources.length; i < n; i++) {
					source = sources[i];
					filepath = getPath(source.type, source.content, htmlpath);
					try {
						content = yield getContent(source.type, filepath);
					} catch (err) {
						// Remove 'inline' attribute if error loading content
						content = source.content.replace(' inline', '');
					}
					// Replace inlined content in html
					html = html.replace(source.content, content);
				}
			}
			fn(null, html);
		} catch (err) {
			fn(err, html);
		}
	})(htmlpath, html);
};

/**
 * Synchronously parse 'html' for <script> and <link> tags containing an 'inline' attribute,
 * and replace with compressed file contents
 * @param {String} htmlpath
 * @param {String} html
 * @returns {String}
 */
module.exports.sync = function (htmlpath, html) {
	// Parse inline sources
	var sources = parse(html)
		, filepath, content;

	// Remove file name if necessary
	htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

	if (sources.length) {
		sources.map(function (source) {
			filepath = getPath(source.type, source.content, htmlpath);
			try {
				content = getContentSync(source.type, filepath);
			} catch (err) {
				// Remove 'inline' attribute if error loading content
				content = source.content.replace(' inline', '');
			}
			// Replace inlined content in html
			html = html.replace(source.content, content);
		});
	}

	return html;
};

/**
 * Parse 'html' for inlineable sources
 * @param {String} html
 * @returns {Array}
 */
function parse (html) {
	var sources = []
		, match;

	// Parse inline <script> tags
	while (match = RE_INLINE_SOURCE.exec(html)) {
		sources.push({content: match[1], type: 'js'});
	}

	// Parse inline <link> tags
	while (match = RE_INLINE_HREF.exec(html)) {
		sources.push({content: match[1], type: 'css'});
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
 * Retrieve content for 'source'
 * @param {String} type
 * @param {String} filepath
 * @returns {String}
 */
function* getContent (type, filepath) {
	var isCSS = (type == 'css')
		, tag = isCSS ? 'style' : 'script'
		, content = yield readFile(filepath, 'utf8');

	return '<' + tag + '>'
		+ compressContent(type, content)
		+ '</' + tag + '>';
}

/**
 * Synchronously retrieve content for 'source'
 * @param {String} type
 * @param {String} filepath
 * @returns {String}
 */
function getContentSync (type, filepath) {
	var isCSS = (type == 'css')
		, tag = isCSS ? 'style' : 'script'
		, content = readFileSync(filepath, 'utf8');

	return '<' + tag + '>'
		+ compressContent(type, content)
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