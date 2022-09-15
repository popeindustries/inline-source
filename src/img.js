import { imgSVG } from './imgSVG.js';
import { getAttributeString } from './utils.js';
import { optimize } from 'svgo';

const RE_XML_TAG = /<\?xml.+?\?>\s+/g;
const SVGO_CONFIG = {
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'minifyStyles',
    // 'cleanupIDs', Prevent removal of unused <symbol> elements
    'cleanupNumericValues',
    'convertColors',
    // 'removeUnknownsAndDefaults', Prevent removal of <image> src attribute
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeViewBox',
    'cleanupEnableBackground',
    'removeHiddenElems',
    'removeEmptyText',
    'convertShapeToPath',
    'convertEllipseToCircle',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'convertPathData',
    'convertTransform',
    // 'removeEmptyAttrs', Prevent removal of xlink:href on <image> elements
    // 'removeUselessDefs',
    'removeEmptyContainers',
    'mergePaths',
    'removeUnusedNS',
    'sortDefsChildren',
    'removeTitle',
    'removeDesc',
  ],
};

/**
 * Handle IMG content
 * @param { Source } source
 * @param { Context } context
 * @returns { Promise<void> }
 */
export async function img(source, context) {
  if (source.fileContent && !source.content && source.type == 'image') {
    const attributeType = source.attributes.type;
    let strict = !source.errored;
    let sourceProp = 'src';
    let data, encoding;

    delete source.attributes.type;

    const isIcon = source.attributes.rel == 'icon';

    // svg
    if (source.format == 'svg+xml' && !isIcon) {
      if (!source.svgAsImage) {
        await imgSVG(source, context, SVGO_CONFIG);
        return;
      }

      source.tag = 'img';
      // Strip xml tag
      source.content = source.fileContent.replace(RE_XML_TAG, '');
      if (source.compress) {
        const result = await optimize(source.content, SVGO_CONFIG);

        source.content = result.data;
      }
      data = encodeURIComponent(source.content);
      encoding = 'charset=utf8';

      // gif/png/jpeg
    } else {
      data = Buffer.from(source.fileContent).toString('base64');
      encoding = 'base64';

      // Favicon
      if (source.tag == 'link') {
        source.attributes.type = attributeType;
        sourceProp = 'href';
        strict = false;
        delete source.attributes.href;
      }
    }

    const src = `data:image/${source.format};${encoding},${data}`;
    let attrs = getAttributeString(
      source.attributes,
      context.attribute,
      strict
    );

    attrs += ` ${sourceProp}="${src}"`;
    source.content = src;
    source.replace = `<${source.tag}${attrs}/>`;
  }
}
