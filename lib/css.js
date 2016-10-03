'use strict';

const noop = require('./utils').noop;

/**
 * Handle CSS content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 * @returns {null}
 */
module.exports = function css (source, context, next) {
  // Handle sync
  next = next || noop;

  if (source.fileContent
    && !source.content
    && (source.type == 'css')) {
      try {
        source.content = source.compress
          ? require('csso').minify(source.fileContent).css
          : source.fileContent;
        // Change tag type
        source.tag = 'style';
        next();
      } catch (err) {
        return next(err);
      }
  } else {
    next();
  }
};