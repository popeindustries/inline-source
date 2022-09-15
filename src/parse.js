import {
  getFormatFromExtension,
  getPadding,
  getSourcepath,
  getTypeFromTag,
  getTypeFromType,
  isFilepath,
  isIgnored,
  isRemoteFilepath,
  parseAttributes,
  parseProps,
} from './utils.js';
import { DefaultHandler, Parser } from 'htmlparser2';
import path from 'node:path';

const RE_COMMENT = /(<!--[^[i][\S\s]+?--\s?>)/gm;

/**
 * Parse inlineable sources, modifying passed 'context'
 * @param { Context } context
 * @returns { Promise<void> }
 */
export async function parse(context) {
  // Remove comments
  const html = context.html.replace(RE_COMMENT, '');
  /** @type { RegExpExecArray | null } */
  let match;

  // This api uses a synchronous callback handler, so order and definition of 'match' is preserved
  const parser = new Parser(
    new DefaultHandler((err, dom) => {
      if (err) {
        throw err;
      }

      const parsed = /** @type { { attribs: Record<String, string> } } */ (dom[0]);

      if (parsed) {
        const [matching, tag] = /** @type { RegExpExecArray } */ (match);
        const attributes = parseAttributes(parsed.attribs);
        const props = parseProps(attributes, context.attribute);
        const type = getTypeFromType(/** @type { string } */ (attributes.type)) || getTypeFromTag(tag);
        const sourcepath = attributes.src || attributes.href || attributes.data;

        // Empty sourcepath attribute will be resolved as "true", so skip
        // Skip link tags without rel=stylesheet/icon (missing rel assumed to be stylesheet)
        if (
          sourcepath === true ||
          (tag === 'link' && attributes.rel && attributes.rel !== 'stylesheet' && attributes.rel !== 'icon')
        ) {
          return;
        }

        if (sourcepath === undefined || isFilepath(sourcepath)) {
          const filepath = getSourcepath(/** @type { string } */ (sourcepath), context.htmlpath, context.rootpath);
          const extension = path.extname(filepath[0]).slice(1);
          const format = getFormatFromExtension(extension);

          // Skip if no source referenced, and ignore based on tag or type
          if (!isIgnored(context.ignore, tag, type, format)) {
            context.sources.push({
              attributes,
              compress: 'compress' in props ? /** @type { boolean } */ (props.compress) : context.compress,
              content: null,
              errored: false,
              extension,
              fileContent: '',
              filepath: filepath[0],
              filepathAnchor: filepath[1],
              format,
              isRemote: isRemoteFilepath(sourcepath),
              match: matching,
              padding: context.pretty ? getPadding(matching, context.html) : '',
              parentContext: context,
              props,
              replace: '',
              sourcepath,
              stack: context.stack,
              svgAsImage: 'svgasimage' in props ? /** @type { boolean } */ (props.svgasimage) : context.svgAsImage,
              tag,
              type,
            });
          }
        }
      }
    }),
  );

  while ((match = context.re.exec(html))) {
    parser.parseComplete(match[0]);
  }
}
