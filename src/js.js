import { minify } from 'terser';

const RE_SCRIPT = /(<)(\/script>)/gi;

/**
 * Handle JavaScript content
 * @param { Source } source
 * @returns { Promise<void> }
 */
export async function js(source) {
  if (source.fileContent && !source.content && source.type == 'js') {
    let content;

    if (!source.compress) {
      content = source.fileContent;
    } else {
      const compressed = await minify(source.fileContent);
      content = /** @type { string } */ (compressed.code);
    }

    // Escape closing </script>
    if (RE_SCRIPT.test(content)) {
      content = content.replace(RE_SCRIPT, '\\x3C$2');
    }

    source.content = content;
  }
}
