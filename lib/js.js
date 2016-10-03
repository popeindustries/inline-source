'use strict';

const noop = require('./utils').noop;

const RE_SCRIPT = /(<)(\/script>)/g;

/**
 * Handle JavaScript content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 * @returns {null}
 */
module.exports = function js (source, context, next) {
  // Handle sync
  next = next || noop;

  if (source.fileContent
    && !source.content
    && (source.type == 'js')) {
      try {
        source.content = source.compress
          ? require('uglify-js').minify(source.fileContent, { fromString: true }).code
          : source.fileContent;

        // Escape closing </script>
        if (RE_SCRIPT.test(source.content)) {
          source.content = source.content.replace(RE_SCRIPT, '\\x3C$2');
        }

        next();
      } catch (err) {
        return next(err);
      }
  } else {
    next();
  }
};