var fs = require('fs')
	, path = require('path')

	, RE_COMMENT = /(<!--[\S\s]+?--\s?>)/gm
	, RE_ESCAPE = /[-\/\\^$*+?.()|[\]{}]/g
	, RE_HREF = /href=["|'](.+?)["|']/
		// Multiline, tags
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
 * Retrieve tag regexp for 'attribute'
 * @param {String} attribute
 * @returns {RegExp}
 */
exports.getTagRegExp = function (attribute) {
	return new RegExp('<([a-zA-Z]+)\\s[\\s\\S]*?' + attribute + '[^>]*?>', 'gm');
};

/**
 * Retrieve type based on 'tag'
 * @param {String} tag
 * @returns {String}
 */
exports.getTypeFromTag = function (tag) {
	switch (tag) {
		case 'script':
			return 'js';
		case 'link':
			return 'css';
		case 'img':
			return 'image';
		default:
			return '';
	}
};

/**
 * Retrieve resolved 'filepath'
 * @param {String} filepath
 * @param {String} rootpath
 * @returns {String}
 */
exports.getSourcepath = function (filepath, rootpath) {
	if (filepath) {
		// Strip leading '/'
		if (filepath.indexOf('/') == 0) filepath = filepath.slice(1);
		return path.resolve(rootpath, filepath);
	}
	return '';
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