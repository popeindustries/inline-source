'use strict';

var isPlainObject = require('lodash/lang/isPlainObject')
	, path = require('path')

	, ATTRIBUTE_BLACKLIST = ['href', 'rel', 'src']
	, RE_ESCAPE = /[-\/\\^$*+?.()|[\]{}]/g
		// Multiline, tags
	, RE_NOT_FILEPATH = /[\r\n<>]/gm;

/**
 * Determine if 'str' is likely a filepath
 * @param {String} str
 * @returns {Boolean}
 */
exports.isFilepath = function (str) {
	RE_NOT_FILEPATH.lastIndex = 0;
	if (str) return !RE_NOT_FILEPATH.test(str);
	return false;
};

/**
 * Retrieve tag regexp for 'attribute'
 * @param {String} attribute
 * @returns {RegExp}
 */
exports.getTagRegExp = function (attribute) {
	return new RegExp('<([a-zA-Z]+)\\b[^>]*?\\s' + attribute + '\\b[^>]*?>(?:<\\/\\1\\s?>)?', 'gm');
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
 * @param {String} htmlpath
 * @param {String} rootpath
 * @returns {String}
 */
exports.getSourcepath = function (filepath, htmlpath, rootpath) {
	if (filepath) {
		if (htmlpath && filepath.indexOf('./') == 0 || filepath.indexOf('../') == 0) {
			return path.resolve(path.dirname(htmlpath), filepath);
		} else {
			// Strip leading '/'
			if (filepath.indexOf('/') == 0) filepath = filepath.slice(1);
			return path.resolve(rootpath, filepath);
		}
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
			case 'image/jpg':
			case 'image/svg+xml':
			case 'image/svg':
			case 'png':
			case 'gif':
			case 'jpeg':
			case 'jpg':
			case 'svg':
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
 * Retrieve format based on 'extension'
 * @param {String} extension
 * @returns {String}
 */
exports.getFormatFromExtension = function (extension) {
	if (extension) {
		switch (extension) {
			case 'js':
				return 'js';
			case 'json':
				return 'json';
			case 'css':
				return 'css';
			case 'gif':
				return 'gif';
			case 'png':
				return 'png';
			case 'jpeg':
			case 'jpg':
				return 'jpeg';
			case 'svg':
				return 'svg+xml';
			default:
				return extension;
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
 * @param {Boolean} strict
 * @returns {String}
 */
exports.getAttributeString = function (attributes, prefix, strict) {
	var str = '';

	for (var prop in attributes) {
		// Ignore blacklisted and prefixed attributes
		var include = strict
			? prop.indexOf(prefix) != 0 && !~ATTRIBUTE_BLACKLIST.indexOf(prop)
			: prop.indexOf(prefix) != 0;

		if (include) {
			str += (attributes[prop] === true)
				? ' ' + prop
				: ' ' + prop + '="' + attributes[prop] + '"';
		}
	}

	return str;
};

/**
 * Retrieve ignored state for 'tag' or 'type' or 'format'
 * @param {String | Array} ignore
 * @param {String} tag
 * @param {String} type
 * @param {String} format
 * @returns {Boolean}
 */
exports.isIgnored = function (ignore, tag, type, format) {
	// Clean svg+xml ==> svg
	var formatAlt = (format && format.indexOf('+'))
		? format.split('+')[0]
		: null;

	// Backwards compat for 3.x style format
	if (isPlainObject(ignore)) {
		var ig = [];
		for (var prop in ignore) {
			if (Array.isArray(ignore[prop])) {
				ig = ig.concat(ignore[prop]);
			} else {
				ig.push(ignore[prop]);
			}
		}
		ignore = ig;
	}

	if (!Array.isArray(ignore)) ignore = [ignore];

	return !!(~ignore.indexOf(tag) || ~ignore.indexOf(type) || ~ignore.indexOf(format) || ~ignore.indexOf(formatAlt));
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
 * No op
 * @param {Error} [err]
 */
exports.noop = function (err) {
	if (err) throw err;
};