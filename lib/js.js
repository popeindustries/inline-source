'use strict';

const RE_SCRIPT = /(<)(\/script>)/gi;

/**
 * Handle JavaScript content
 * @param { object } source
 * @param { object } context
 * @returns { Promise<void> }
 */
module.exports = async function js(source) {
  if (source.fileContent && !source.content && source.type == 'js') {
    let content;

    if (!source.compress) {
      content = source.fileContent;
    } else {
      const compressed = await require('terser').minify(source.fileContent);
      if (compressed.error) {
        throw compressed.error;
      }

      content = compressed.code;
    }

    // Escape closing </script>
    if (RE_SCRIPT.test(content)) {
      content = content.replace(RE_SCRIPT, '\\x3C$2');
    }

    source.content = content;
  }
};
