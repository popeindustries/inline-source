'use strict';

const { URL } = require('url');
const path = require('path');

const ATTRIBUTE_BLACKLIST = [
  'href',
  'rel',
  'src',
  'data',
  'xmlns',
  'xmlns:xlink',
  'version',
  'baseprofile',
];
const RE_ANY = /<(script|link|img|object)\s?[^>]*?>(?:<\/\1\s?>)?/gm;
const RE_ESCAPE = /[-/\\^$*+?.()|[\]{}]/g;
// Multiline, tags, data:uri
const RE_NOT_FILEPATH = /[\r\n<>]|^data:/gm;
const RE_QUERY = /\?[^#]*/g;
const RE_REMOTE = /^https?:\/\//;
const RE_FORWARD_SLASH = /\//g;

module.exports = {
  escape,
  getAttributeString,
  getFormatFromExtension,
  getPadding,
  getSourcepath,
  getTagRegExp,
  getTypeFromTag,
  getTypeFromType,
  isFilepath,
  isIgnored,
  isRelativeFilepath,
  isRemoteFilepath,
  parseAttributes,
  parseProps,
};
/**
 * Determine if 'str' is likely a filepath
 * @param { string } str
 * @returns { boolean }
 */
function isFilepath(str) {
  RE_NOT_FILEPATH.lastIndex = 0;
  if (str) {
    return !RE_NOT_FILEPATH.test(str);
  }
  return false;
}

/**
 * Determine if 'str' is a relative filepath
 * @param { string } str
 * @returns { boolean }
 */
function isRelativeFilepath(str) {
  if (str) {
    return (
      isFilepath(str) && (str.indexOf('./') == 0 || str.indexOf('../') == 0)
    );
  }
  return false;
}

/**
 * Determine if 'str' is a remote filepath
 * @param { string } str
 * @returns { boolean }
 */
function isRemoteFilepath(str) {
  if (str) {
    return isFilepath(str) && RE_REMOTE.test(str);
  }
  return false;
}

/**
 * Retrieve tag regexp for 'attribute'
 * @param { string } attribute
 * @returns { RegExp }
 */
function getTagRegExp(attribute) {
  if (attribute) {
    // <([a-zA-Z]+)\b[^>]*?\s(?:inline [^>]*?|inline|inline=([\'\"]).*?\2[^>]*?)>(?:<\/\1\s?>)?
    return new RegExp(
      '<([a-zA-Z]+)\\b[^>]*?\\s(?:' +
        attribute +
        '\\b[^>]*?|' +
        attribute +
        '|' +
        attribute +
        '=([\\\'\\"])(?:true|' +
        attribute +
        ')\\2[^>]*?)>(?:<\\/\\1\\s?>)?',
      'gm'
    );
  }
  return RE_ANY;
}

/**
 * Parse 'attributes'
 * @param { object } attributes
 * @returns { object }
 */
function parseAttributes(attributes) {
  for (const prop in attributes) {
    // Parse boolean values
    if (attributes[prop] === '') {
      attributes[prop] = true;
    }
  }

  return attributes;
}

/**
 * Parse props with 'prefix' from 'attributes'
 * @param { object } attributes
 * @param { string } prefix
 * @returns { object }
 */
function parseProps(attributes, prefix) {
  prefix += '-';

  const props = {};

  for (const prop in attributes) {
    // Strip 'inline-' and store
    if (prop.indexOf(prefix) == 0) {
      let value = attributes[prop];

      if (value === 'false') {
        value = false;
      }
      if (value === 'true') {
        value = true;
      }
      props[prop.slice(prefix.length)] = value;
    }
  }

  return props;
}

/**
 * Retrieve resolved 'filepath' and optional anchor
 * @param { string } filepath
 * @param { string } htmlpath
 * @param { string } rootpath
 * @returns { Array<string> }
 */
function getSourcepath(filepath, htmlpath, rootpath) {
  if (!filepath) {
    return ['', ''];
  }

  if (isRemoteFilepath(filepath)) {
    const url = new URL(filepath);

    filepath = `./${url.pathname.slice(1).replace(RE_FORWARD_SLASH, '_')}`;
  }
  // Strip query params
  filepath = filepath.replace(RE_QUERY, '');
  // Relative path
  if (htmlpath && isRelativeFilepath(filepath)) {
    filepath = path.resolve(path.dirname(htmlpath), filepath);
    // Strip leading '/'
  } else if (filepath.indexOf('/') == 0) {
    filepath = filepath.slice(1);
  }
  if (filepath.includes('#')) {
    filepath = filepath.split('#');
  }

  return Array.isArray(filepath)
    ? [path.resolve(rootpath, filepath[0]), filepath[1]]
    : [path.resolve(rootpath, filepath), ''];
}

/**
 * Retrieve type based on 'type'
 * @param { string } type
 * @returns { string }
 */
function getTypeFromType(type) {
  if (type) {
    switch (type) {
      case 'application/javascript':
      case 'application/x-javascript':
      case 'application/ecmascript':
      case 'text/javascript':
      case 'text/form-script':
      case 'text/ecmascript':
      case 'javascript':
      case 'js':
      case 'ecmascript':
      case 'module':
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
}

/**
 * Retrieve type based on 'tag'
 * @param { string } tag
 * @returns { string }
 */
function getTypeFromTag(tag) {
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
}

/**
 * Retrieve format based on 'extension'
 * @param { string } extension
 * @returns { string }
 */
function getFormatFromExtension(extension) {
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
}

/**
 * Retrieve leading whitespace for 'source' in 'html'
 * @param { string } source
 * @param { string } html
 * @returns { string }
 */
function getPadding(source, html) {
  const re = new RegExp(`^([\\t ]+)${escape(source)}`, 'gm');
  const match = re.exec(html);

  return match ? match[1] : '';
}

/**
 * Retrieve stringified attributes
 * @param { object } attributes
 * @param { string } prefix
 * @param { boolean } strict
 * @returns { string }
 */
function getAttributeString(attributes, prefix, strict) {
  let str = '';

  for (const prop in attributes) {
    // Ignore blacklisted and prefixed attributes
    const include = strict
      ? prop.indexOf(prefix) != 0 && !ATTRIBUTE_BLACKLIST.includes(prop)
      : prop.indexOf(prefix) != 0;

    if (include) {
      str +=
        attributes[prop] === true
          ? ` ${prop}`
          : ` ${prop}="${attributes[prop]}"`;
    }
  }

  return str;
}

/**
 * Retrieve ignored state for 'tag' or 'type' or 'format'
 * @param { string | Array<string> } ignore
 * @param { string } tag
 * @param { string } type
 * @param { string } format
 * @returns { boolean }
 */
function isIgnored(ignore, tag, type, format) {
  // Clean svg+xml ==> svg
  const formatAlt = format && format.indexOf('+') ? format.split('+')[0] : null;

  if (!Array.isArray(ignore)) {
    ignore = [ignore];
  }

  return !!(
    ignore.includes(tag) ||
    ignore.includes(type) ||
    ignore.includes(format) ||
    ignore.includes(formatAlt)
  );
}

/**
 * Escape 'str' for use in RegExp constructor
 * @param { string } str
 * @returns { string }
 */
function escape(str) {
  return str.replace(RE_ESCAPE, '\\$&');
}
