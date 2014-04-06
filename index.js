var Promise = require('bluebird')
	, path = require('path')
	, fs = require('fs')
	, readFileAsync = Promise.promisify(fs.readFile)
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
 * @param {Function} [fn(err, html)]
 * @returns {Promise}
 */
module.exports = function (htmlpath, html, fn) {
	// Remove file name if necessary
	htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

	// Parse inline sources
	var sources = parse(html);

	if (sources.length) {
		// Get inlined content
		return Promise.all(sources.map(function (source) {
			return getContent(source.type, source.content, htmlpath, true)
				.then(function (content) {
					return [source.content, content];
				});
		// Replace inlined content in html
		})).then(function (sources) {
			sources.forEach(function (source) {
				html = html.replace(source[0], source[1]);
			});
			return html;
		}).nodeify(fn);

	// Return untouched html if no content to inline
	} else {
		return Promise.resolve(html).nodeify(fn);
	}
};

/**
 * Synchronously parse 'html' for <script> and <link> tags containing an 'inline' attribute,
 * and replace with compressed file contents
 * @param {String} htmlpath
 * @param {String} html
 * @returns {String}
 */
module.exports.sync = function (htmlpath, html) {
	// Remove file name if necessary
	htmlpath = path.extname(htmlpath).length ? path.dirname(htmlpath) : htmlpath;

	// Parse inline sources
	var sources = parse(html);

	if (sources.length) {
		sources.map(function (source) {
			try {
				var content = getContent(source.type, source.content, htmlpath, false);
				return [source.content, content];
			} catch (err) {
				// Remove 'inline' attribute if error loading content
				return [source.content, source.content.replace(' inline', '')];
			}
		// Replace inlined content in html
		}).forEach(function (source) {
			html = html.replace(source[0], source[1]);
		})
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
 * Retrieve content for 'source'
 * @param {String} type
 * @param {String} source
 * @param {String} htmlpath
 * @param {Boolean} async
 * @returns {String}
 */
function getContent (type, source, htmlpath, async) {
	var isCSS = (type == 'css')
		, tag = isCSS ? 'style' : 'script'
		// Parse url
		, sourcepath = source.match(isCSS ? RE_HREF : RE_SRC)[1]
		, filepath = sourcepath.indexOf('/') == 0
			// Absolute
			? path.resolve(process.cwd(), sourcepath.slice(1))
			// Relative
			: path.resolve(htmlpath, sourcepath)
		, content;

	if (async) {
		return readFileAsync(filepath, 'utf8')
			.then(function (content) {
				return '<' + tag + '>'
					+ compressContent(type, content)
					+ '</' + tag + '>';
			}).catch(function (err) {
				// Remove 'inline' attribute if error loading content
				return source.replace(' inline', '');
			});
	} else {
		content = readFileSync(filepath, 'utf8');
		return '<' + tag + '>'
			+ compressContent(type, content)
			+ '</' + tag + '>';
	}
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
	} catch (err) { /* return uncompressed if error */}

	return content;
}