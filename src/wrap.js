import { getAttributeString } from './utils.js';

const RE_BEGIN_LINE = /^./gm;

/**
 * Wrap source content
 * @param { Source } source
 * @param { Context } context
 * @returns { void }
 */
export function wrap(source, context) {
  if (source.content !== null && !source.replace) {
    const attrs = getAttributeString(
      source.attributes,
      context.attribute,
      !source.errored
    );
    // link tags are not closed
    const closing = source.tag != 'link' ? `</${source.tag}>` : '';
    const content = context.pretty
      ? `\n${source.content.replace(RE_BEGIN_LINE, source.padding + '$&')}\n${
          source.padding
        }`
      : source.content;

    source.replace = `<${source.tag + attrs}>${content}${closing}`;
  }
}
