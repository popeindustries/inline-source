'use strict';

/**
 * Load content for 'source'
 * @param {Object} source
 * @param {Object} context
 * @returns {Promise}
 */
module.exports = function load(source, context) {
  if (source.fileContent == null && source.filepath != null) {
    // Raw buffer if image and not svg
    const encoding = source.type == 'image' && source.format != 'svg+xml' ? null : 'utf8';

    source.fileContent = context.fs.readFileSync(source.filepath, encoding);
  }

  return Promise.resolve();
};
