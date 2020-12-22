'use strict';

/**
 * Handle CSS content
 * @param { object } source
 * @param { object } context
 * @returns { Promise<void> }
 */
module.exports = async function css(source) {
  if (source.fileContent && !source.content && source.type == 'css') {
    source.content = source.compress
      ? require('csso').minify(source.fileContent).css
      : source.fileContent;
    // Change tag type
    source.tag = 'style';
  }
};
