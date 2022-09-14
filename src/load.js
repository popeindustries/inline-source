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
      source.fileContent = context.fs.readFileSync(source.filepath, encoding);
    } catch (err) {
      if (!source.isRemote) {
        throw err;
      }

      const res = await agent.get(source.sourcepath).buffer(true);

      // Save for later
      if (context.saveRemote) {
        try {
          context.fs.writeFileSync(source.filepath, res.text, 'utf8');
        } catch (err) {
          // Skip
        }
      }
      source.fileContent = res.text;
    }
  }
}
