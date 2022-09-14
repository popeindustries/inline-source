/**
 * Inline source content
 * @param { Source } source
 * @param { Context } context
 * @returns { void }
 */
export function inline(source, context) {
  if (source.replace) {
    // Fix for #5
    context.html = context.html.replace(source.match, () => source.replace);
  }
}
