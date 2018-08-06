'use strict';

/**
 * Handle CSS content
 * @param {Object} source
 * @param {Object} context
 * @returns {Promise}
 */
module.exports = function css(source) {
  return new Promise((resolve, reject) => {
    if (source.fileContent && !source.content && source.type == 'css') {
      try {
        source.content = source.compress
          ? require('csso').minify(source.fileContent).css
          : source.fileContent;
        // Change tag type
        source.tag = 'style';
      } catch (err) {
        reject(err);
      }
    }
    resolve();
  });
};
