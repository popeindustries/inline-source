'use strict';

const RE_SCRIPT = /(<)(\/script>)/g;

/**
 * Handle JavaScript content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 * @returns {null}
 */
module.exports = function js(source, context, next) {
  if (source.fileContent && !source.content && source.type == 'js') {
    let content;

    if (!source.compress) {
      content = source.fileContent;
    } else {
      const compressed = require('uglify-js').minify(source.fileContent);

      if (compressed.error) {
        if (next !== undefined) {
          return next(compressed.error);
        }
        throw compressed.error;
      }

      content = compressed.code;
    }

    // Escape closing </script>
    if (RE_SCRIPT.test(content)) {
      content = content.replace(RE_SCRIPT, '\\x3C$2');
    }

    source.content = content;

    next && next();
  } else {
    next && next();
  }
};
