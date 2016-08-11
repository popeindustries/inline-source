'use strict';

/**
 * Inline source content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} next(err)
 */
module.exports = function inline (source, context, next) {
  if (source.replace) {
    // Fix for PR#5
    context.html = context.html.replace(source.match, () => {
      return source.replace;
    });
  }

  if (next) next();
};