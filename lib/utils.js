var fs = require('fs')
	, path = require('path')

	, RE_COMMENT = /(<!--[\S\s]+?--\s?>)/gm
		// Multiline, tags
	, RE_ESCAPE = /[-\/\\^$*+?.()|[\]{}]/g
	, RE_HREF = /href=["|'](.+?)["|']/
	, RE_NOT_FILEPATH = /[\r\n<>]/gm
	, RE_SRC = /src=["|'](.+?)["|']/;

/**
 * Determine if 'str' is likely a filepath
 * @param {String} str
 * @returns {Boolean}
 */
exports.isFilepath = function (str) {
	if (str) return !RE_NOT_FILEPATH.test(str);
	return false;
};

/**
 * Retrieve filepath for 'source'
 * @param {String} type
 * @param {String} source
 * @param {String} htmlpath
 * @param {String} rootpath
 * @returns {String}
 */
exports.getSourcepath = function (type, source, htmlpath, rootpath) {
	var isCSS = (type == 'css')
		// Parse url
		, match = source.match(isCSS ? RE_HREF : RE_SRC)[1]
		, sourcepath = path.isAbsolute(match)
			// Absolute from passed rootpath
			? path.resolve(rootpath, match.slice(1))
			// Relative to html document
			// TODO: should this be from rootpath (webroot)?
			: path.resolve(htmlpath, match);

	return sourcepath;
};

/**
 * Retrieve leading whitespace for 'source' in 'html'
 * @param {String} source
 * @param {String} html
 * @returns {String}
 */
exports.getPadding = function (source, html) {
	var re = new RegExp('^([\\t ]+)' + exports.escape(source), 'gm')
		, match = re.exec(html);

	return match ? match[1] : '';
};

/**
 * Escape 'str' for use in RegExp constructor
 * @param {String} str
 * @returns {String}
 */
exports.escape = function (str) {
	return str.replace(RE_ESCAPE, '\\$&');
};

/**
 * Wrap 'content' in appropriate tag based on 'type'
 * @param {String} type
 * @param {String} content
 * @param {Object} options
 * @returns {String}
 */
exports.wrapContent = function (type, content, options) {
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
};

/**
 * Compress 'content' of 'type'
 * @param {String} type
 * @param {String} content
 * @returns {String}
 */
exports.compressContent = function (type, content) {
	// try {
	// 	content = (type == 'css')
	// 		? csso.justDoIt(content)
	// 		: uglify.minify(content, {fromString: true}).code;
	// } catch (err) { /* return uncompressed if error */ }

	// return content;
};