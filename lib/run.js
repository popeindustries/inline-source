'use strict';

const isTest = process.env.NODE_ENV === 'test';

/**
 * Process stack for 'sources'
 * @param { object } context
 * @param { Array<object> } sources
 * @param { boolean } swallowErrors
 * @returns { Promise<string> }
 */
module.exports = async function run(context, sources = [], swallowErrors) {
  return Promise.all(
    sources.map(async (source) => {
      for (const handler of source.stack) {
        try {
          await handler(source, context);
        } catch (err) {
          if (!swallowErrors) {
            throw err;
          }
          if (!isTest) {
            console.warn(err.message);
          }
          // Clear content
          source.content = '';
          source.errored = true;
        }
      }
    })
  ).then(() => context.html);
};
