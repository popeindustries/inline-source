'use strict';

/**
 * Load content for 'source'
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 */
module.exports = function load (source, context, next) {
  var fs = context.fs || require('fs');
  if (!source.fileContent && source.filepath) {
    // Raw buffer if image and not svg
    var encoding = (source.type == 'image' && source.format != 'svg+xml')
      ? null
      : 'utf8';

    if (next) {
      fs.readFile(source.filepath, encoding, (err, content) => {
        if (err) return next(err);
        source.fileContent = content;
        return next();
      });
    } else {
      source.fileContent = fs.readFileSync(source.filepath, encoding);
    }
  } else {
    if (next) next();
  }
};