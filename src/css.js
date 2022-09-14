/**
 * Handle CSS content
 * @param { Source } source
 * @returns { Promise<void> }
 */
export async function css(source) {
  if (source.fileContent && !source.content && source.type == 'css') {
    source.content = source.compress
      ? require('csso').minify(source.fileContent).css
      : source.fileContent;
    // Change tag type
    source.tag = 'style';
  }
}
