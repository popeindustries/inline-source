var fs = require('fs')
	, path = require('path')

	, ATTRIBUTE_BLACKLIST = ['href', 'rel', 'src']
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
	return new RegExp('<([a-zA-Z]+)\\b[\\sa-zA-Z=\'"\\-/._]*?\\s' + attribute + '\\b[^>]*?>(?:<\\/\\1\\s?>)?', 'gm');
	// return new RegExp('<([a-zA-Z]+)\\b[\\sa-zA-Z=\'"\\-/._]*?\\s' + attribute + '\\b[^>]*?>', 'gm');
};

/**
 * Parse 'attributes'
 * @param {Object} attributes
 * @returns {Object}
 */
exports.parseAttributes = function (attributes) {
	for (var prop in attributes) {
		// Parse boolean values
		if (attributes[prop] === '') attributes[prop] = true;
	}

	return attributes;
};

/**
 * Parse props with 'prefix' from 'attributes'
 * @param {Object} attributes
 * @param {String} prefix
 * @returns {Object}
 */
exports.parseProps = function (attributes, prefix) {
	prefix += '-';

	var props = {};

	for (var prop in attributes) {
		// Strip 'inline-' and store
		if (prop.indexOf(prefix) == 0) {
			props[prop.slice(prefix.length)] = attributes[prop];
		}
	}

	return props;
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
 * Retrieve type based on 'type'
 * @param {String} tag
 * @returns {String}
 */
exports.getTypeFromType = function (type) {
	if (type) {
		switch (type) {
			case 'application/javascript':
			case 'application/x-javascript':
			case 'application/ecmascript':
			case 'text/javascript':
			case 'text/ecmascript':
			case 'javascript':
			case 'js':
			case 'ecmascript':
				return 'js';
			case 'text/css':
			case 'css':
				return 'css';
			case 'image/png':
			case 'image/gif':
			case 'image/jpeg':
			case 'png':
			case 'gif':
			case 'jpeg':
			case 'image':
				return 'image';
			case 'application/json':
			case 'text/json':
			case 'json':
				return 'json';
			default:
				return type;
		}
	}
};

/**
 * Retrieve type based on 'tag'
 * @param {String} tag
 * @returns {String}
 */
exports.getTypeFromTag = function (tag) {
	if (tag) {
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
	}
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
 * Retrieve stringified attributes
 * @param {Object} attributes
 * @param {String} prefix
 * @returns {String}
 */
exports.getAttributeString = function (attributes, prefix) {
	var str = '';

	for (var prop in attributes) {
		// Ignore blacklisted and prefixed attributes
		if (prop.indexOf(prefix) != 0 && !~ATTRIBUTE_BLACKLIST.indexOf(prop)) {
			str += (attributes[prop] === true)
				? ' ' + prop
				: ' ' + prop + '="' + attributes[prop] + '"';
		}
	}

	return str;
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