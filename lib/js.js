'use strict';

const noop = require('./utils').noop;

const RE_SCRIPT = /(<)(\/script>)/g;

/**
 * Handle JavaScript content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 * @returns {null}
 */
module.exports = function js(source, context, next) {
  // Handle sync
  next = next || noop;

  if (source.fileContent && !source.content && source.type == 'js') {
    try {
      let content;
      
      if (source.compress) {
        const uglifyResult = require('uglify-js').minify(source.fileContent);
        
        if (uglifyResult.error) throw uglifyResult.error;
        
        content = uglifyResult.code;
      } else {
        content = source.fileContent;
      }
      
      source.content = content;

      // Escape closing </script>
      if (RE_SCRIPT.test(source.content)) {
        source.content = source.content.replace(RE_SCRIPT, '\\x3C$2');
      }

      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
};
