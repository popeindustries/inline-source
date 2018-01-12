'use strict';

/**
 * Load content for 'source'
 * @param {Object} source
 * @param {Object} context
 * @returns {Promise}
 */
module.exports = function load(source, context) {
  return new Promise((resolve, reject) => {
    if (!source.fileContent && source.filepath) {
      // Raw buffer if image and not svg
      const encoding = source.type == 'image' && source.format != 'svg+xml' ? null : 'utf8';

      try {
        source.fileContent = context.fs.readFileSync(source.filepath, encoding);
      } catch (err) {
        return reject(err);
      }
    }
    resolve();
  });
};
