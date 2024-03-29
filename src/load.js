/**
 * Load content for 'source'
 * @param { Source } source
 * @param { Context } context
 * @returns { Promise<void> }
 */
export async function load(source, context) {
  if (!source.fileContent && source.filepath) {
    // Raw buffer if image and not svg
    const encoding =
      source.type == 'image' && source.format != 'svg+xml' ? null : 'utf8';

    try {
      // @ts-ignore
      source.fileContent = context.fs.readFileSync(source.filepath, encoding);
    } catch (err) {
      if (!source.isRemote) {
        throw err;
      }
    }

    if (source.isRemote) {
      // node-fetch is esm-only, so support cjs via import()
      const fetch = (await import('node-fetch')).default;
      const res = await fetch(/** @type { string } */ (source.sourcepath));

      if (!res.ok) {
        throw Error(
          res.status === 404 ? 'Not found' : `Fetch error: ${res.status}`,
        );
      }

      const text = await res.text();

      // Save for later
      if (context.saveRemote) {
        try {
          context.fs.writeFileSync(source.filepath, text, 'utf8');
        } catch (err) {
          // Skip
        }
      }
      source.fileContent = text;
    }
  }
}
