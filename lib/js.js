'use strict';

const RE_SCRIPT = /(<)(\/script>)/gi;

/**
 * Handle JavaScript content
 * @param {Object} source
 * @param {Object} context
 * @returns {Promise}
 */
module.exports = function js(source) {
  return new Promise((resolve, reject) => {
    if (source.fileContent && !source.content && source.type == 'js') {
      let content;

      if (!source.compress) {
        content = source.fileContent;
      } else {
        const compressed = require('terser').minify(source.fileContent);
        if (compressed.error) {
          return reject(compressed.error);
        }

        content = compressed.code;
      }

      // Escape closing </script>
      if (RE_SCRIPT.test(content)) {
        content = content.replace(RE_SCRIPT, '\\x3C$2');
      }

      source.content = content;
    }

    resolve();
  });
};
