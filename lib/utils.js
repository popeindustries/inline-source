'use strict';

const isPlainObject = require('lodash/isPlainObject');
const path = require('path');

const ATTRIBUTE_BLACKLIST = ['href', 'rel', 'src', 'data', 'xmlns', 'xmlns:xlink', 'version', 'baseprofile'];
const RE_ESCAPE = /[-\/\\^$*+?.()|[\]{}]/g;
// Multiline, tags
const RE_NOT_FILEPATH = /[\r\n<>]/gm;

module.exports = {
  /**
   * Determine if 'str' is likely a filepath
   * @param {String} str
   * @returns {Boolean}
   */
  isFilepath (str) {
    RE_NOT_FILEPATH.lastIndex = 0;
    if (str) return !RE_NOT_FILEPATH.test(str);
    return false;
  },

  /**
   * Retrieve tag regexp for 'attribute'
   * @param {String} attribute
   * @returns {RegExp}
   */
  getTagRegExp (attribute) {
    // <([a-zA-Z]+)\b[^>]*?\s(?:inline [^>]*?|inline|inline=([\'\"]).*?\2[^>]*?)>(?:<\/\1\s?>)?
    return new RegExp('<([a-zA-Z]+)\\b[^>]*?\\s(?:' + attribute + ' [^>]*?|' + attribute + '|' + attribute + '=([\\\'\\\"])(?:true|' + attribute + ')\\2[^>]*?)>(?:<\\/\\1\\s?>)?', 'gm');
  },

  /**
   * Parse 'attributes'
   * @param {Object} attributes
   * @returns {Object}
   */
  parseAttributes (attributes) {
    for (const prop in attributes) {
      // Parse boolean values
      if (attributes[prop] === '') attributes[prop] = true;
    }

    return attributes;
  },

  /**
   * Parse props with 'prefix' from 'attributes'
   * @param {Object} attributes
   * @param {String} prefix
   * @returns {Object}
   */
  parseProps (attributes, prefix) {
    prefix += '-';

    let props = {};

    for (const prop in attributes) {
      // Strip 'inline-' and store
      if (prop.indexOf(prefix) == 0) {
        props[prop.slice(prefix.length)] = attributes[prop];
      }
    }

    return props;
  },

  /**
   * Retrieve resolved 'filepath' and optional anchor
   * @param {String} filepath
   * @param {String} htmlpath
   * @param {String} rootpath
   * @returns {Array}
   */
  getSourcepath (filepath, htmlpath, rootpath) {
    if (filepath) {
      // Relative path
      if (htmlpath && filepath.indexOf('./') == 0 || filepath.indexOf('../') == 0) {
        filepath = path.resolve(path.dirname(htmlpath), filepath);
      } else {
        // Strip leading '/'
        if (filepath.indexOf('/') == 0) filepath = filepath.slice(1);
      }
      if (~filepath.indexOf('#')) filepath = filepath.split('#');

      return Array.isArray(filepath)
        ? [path.resolve(rootpath, filepath[0]), filepath[1]]
        : [path.resolve(rootpath, filepath), ''];
    }

    return ['', ''];
  },

  /**
   * Retrieve type based on 'type'
   * @param {String} type
   * @returns {String}
   */
  getTypeFromType (type) {
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
  },

  /**
   * Retrieve type based on 'tag'
   * @param {String} tag
   * @returns {String}
   */
  getTypeFromTag (tag) {
    if (tag) {
      switch (tag) {
        case 'script':
          return 'js';
        case 'link':
          return 'css';
        case 'img':
        case 'object':
          return 'image';
        default:
          return '';
      }
    }
  },

  /**
   * Retrieve format based on 'extension'
   * @param {String} extension
   * @returns {String}
   */
  getFormatFromExtension (extension) {
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
  },

  /**
   * Retrieve leading whitespace for 'source' in 'html'
   * @param {String} source
   * @param {String} html
   * @returns {String}
   */
  getPadding (source, html) {
    const re = new RegExp('^([\\t ]+)' + this.escape(source), 'gm');
    const match = re.exec(html);

    return match ? match[1] : '';
  },

  /**
   * Retrieve stringified attributes
   * @param {Object} attributes
   * @param {String} prefix
   * @param {Boolean} strict
   * @returns {String}
   */
  getAttributeString (attributes, prefix, strict) {
    let str = '';

    for (const prop in attributes) {
      // Ignore blacklisted and prefixed attributes
      const include = strict
        ? prop.indexOf(prefix) != 0 && !~ATTRIBUTE_BLACKLIST.indexOf(prop)
        : prop.indexOf(prefix) != 0;

      if (include) {
        str += (attributes[prop] === true)
          ? ' ' + prop
          : ' ' + prop + '="' + attributes[prop] + '"';
      }
    }

    return str;
  },

  /**
   * Retrieve ignored state for 'tag' or 'type' or 'format'
   * @param {String | Array} ignore
   * @param {String} tag
   * @param {String} type
   * @param {String} format
   * @returns {Boolean}
   */
  isIgnored (ignore, tag, type, format) {
    // Clean svg+xml ==> svg
    const formatAlt = (format && format.indexOf('+'))
      ? format.split('+')[0]
      : null;

    // Backwards compat for 3.x style format
    if (isPlainObject(ignore)) {
      let ig = [];

      for (const prop in ignore) {
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
  },

  /**
   * Escape 'str' for use in RegExp constructor
   * @param {String} str
   * @returns {String}
   */
  escape (str) {
    return str.replace(RE_ESCAPE, '\\$&');
  },

  /**
   * No op
   * @param {Error} [err]
   */
  noop (err) {
    if (err) throw err;
  }
};
