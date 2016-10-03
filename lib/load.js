'use strict';

/**
 * Load content for 'source'
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 */
module.exports = function load (source, context, next) {
  if (!source.fileContent && source.filepath) {
    // Raw buffer if image and not svg
    const encoding = (source.type == 'image' && source.format != 'svg+xml')
      ? null
      : 'utf8';

    if (next) {
      context.fs.readFile(source.filepath, encoding, (err, content) => {
        if (err) return next(err);
        source.fileContent = content;
        return next();
      });
    } else {
      source.fileContent = context.fs.readFileSync(source.filepath, encoding);
    }
  } else {
    if (next) next();
  }
};