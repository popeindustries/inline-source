'use strict';

const { getAttributeString, parseAttributes } = require('./utils');
const htmlparser = require('htmlparser2');

const DEFAULT_SVG_ATTR = {
  x: '0',
  y: '0',
  viewBox: '0 0 100 100'
};
const RE_SVG_CONTENT = /<svg[^>]+>([\S\s]*?)<\/\s?svg>/gm;
const RE_SYMBOL = /<symbol\sid=['"]([^'"]+)[\S\s]*?<\/\s?symbol>/gm;

/**
 * Handle IMG content
 * @param {Object} source
 * @param {Object} context
 * @param {Object} svgo
 * @returns {Promise}
 */
module.exports = function imgSVG(source, context, svgo) {
  return new Promise(async (resolve, reject) => {
    RE_SVG_CONTENT.lastIndex = 0;
    RE_SYMBOL.lastIndex = 0;

    const svgContent =
      RE_SVG_CONTENT.exec(source.fileContent) || source.fileContent;
    // Use default attributes if no outer <svg> tag
    const defaultAttributes = Array.isArray(svgContent) ? {} : DEFAULT_SVG_ATTR;
    let attributes = {};
    const parser = new htmlparser.Parser(
      new htmlparser.DomHandler((err, dom) => {
        if (err) {
          return reject(err);
        }

        dom = dom.filter((item) => item.type == 'tag' && item.name == 'svg');

        if (dom.length) {
          attributes = parseAttributes(dom[0].attribs);
          // Fix lowercasing
          if ('viewbox' in attributes) {
            attributes.viewBox = attributes.viewbox;
            delete attributes.viewbox;
          }
        }
      })
    );

    // Strip xml tag
    parser.parseComplete(source.fileContent);
    source.content = Array.isArray(svgContent) ? svgContent[1] : svgContent;
    source.attributes = Object.assign(
      {},
      defaultAttributes,
      attributes,
      source.attributes
    );
    // Remove the alt attribute if it exists. alt attributes are not allowed on svg elements as per W3C spec
    // @see https://www.w3.org/TR/SVG/attindex.html for allowed attributes
    if ('alt' in source.attributes) {
      delete source.attributes.alt;
    }
    source.tag = 'svg';
    // Handle subset of symbols as specified with filepath anchor (foo.svg#foo,bar)
    if (source.filepathAnchor) {
      const includedIds = source.filepathAnchor.split(',');
      let content = source.content;
      let match;

      while ((match = RE_SYMBOL.exec(source.content))) {
        if (!includedIds.includes(match[1])) {
          content = content.replace(match[0], '');
        }
      }

      source.content = content;
    }
    if (source.compress) {
      RE_SVG_CONTENT.lastIndex = 0;
      // svgo sometiemes throws errors if content not wrapped in <svg>, so wrap here
      const attrs = getAttributeString(
        source.attributes,
        context.attribute,
        false
      );
      const content = `<svg${attrs}>${source.content}</svg>`;
      const result = await svgo.optimize(content);
      const rematch = RE_SVG_CONTENT.exec(result.data);

      if (rematch) {
        source.content = rematch[1];
      } else {
        // Error re-parsing, leave as is;
        source.replace = result.data;
      }
    }

    resolve();
  });
};
