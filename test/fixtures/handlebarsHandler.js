import Handlebars from 'handlebars';

const HANDLEBARS_TYPE = 'text/x-handlebars-template';

/**
 * Handle JavaScript content
 * @param {object} source
 * @param {object} context
 * @returns {Promise}
 */
export function handlebarsHandler(source) {
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
}
