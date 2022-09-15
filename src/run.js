const isTest = process.env.NODE_ENV === 'test';

/**
 * Process stack for 'sources'
 * @param { Context } context
 * @param { Array<Source> } sources
 * @param { boolean } swallowErrors
 * @returns { Promise<string> }
 */
export async function run(context, sources = [], swallowErrors) {
  await Promise.all(
    sources.map(async (source) => {
      for (const handler of source.stack) {
        try {
          await handler(source, context);
        } catch (err) {
          if (!swallowErrors) {
            throw err;
          }
          if (!isTest) {
            console.warn(/** @type { Error } */ (err).message);
          }
          // Clear content
          source.content = '';
          source.errored = true;
        }
      }
    }),
  );

  return context.html;
}
