'use strict';

const Handlebars = require('handlebars');

const HANDLEBARS_TYPE = 'text/x-handlebars-template';

/**
 * Handle JavaScript content
 * @param {Object} source
 * @param {Object} context
 * @returns {Promise}
 */
module.exports = function handlbars(source) {
  return new Promise((resolve, reject) => {
    if (
      source.fileContent &&
      !source.content &&
      source.type == HANDLEBARS_TYPE
    ) {
      let content;

      try {
        content = Handlebars.precompile(source.fileContent);
      } catch (err) {
        return reject(err);
      }

      source.content = `window.templates=${content}`;
    }

    resolve();
  });
};
