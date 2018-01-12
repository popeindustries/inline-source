'use strict';

/**
 * Inline source content
 * @param {Object} source
 * @param {Object} context
 * @returns {Promise}
 */
module.exports = function inline(source, context) {
  if (source.replace) {
    // Fix for PR#5
    context.html = context.html.replace(source.match, () => {
      return source.replace;
    });
  }

  return Promise.resolve();
};
