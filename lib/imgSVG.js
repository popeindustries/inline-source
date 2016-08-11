'use strict';

const htmlparser = require('htmlparser2');
const merge = require('lodash/merge');
const utils = require('./utils');

const DEFAULT_SVG_ATTR = {
  x: '0',
  y: '0',
  viewBox: '0 0 100 100'
};
const RE_SVG_CONTENT = /<svg[^>]+>([\S\s]*?)<\/\s?svg>/gm;
const RE_SYMBOL = /<symbol\sid=['"](.+)['"]>[\S\s]*?<\/\s?symbol>/gm;

/**
 * Handle IMG content
 * @param {Object} source
 * @param {Object} context
 * @param {Object} svgo
 * @param {Function} [next]
 * @returns {null}
 */
module.exports = function imgSVG (source, context, svgo, next) {
  RE_SVG_CONTENT.lastIndex = 0;
  RE_SYMBOL.lastIndex = 0;

  const svgContent = RE_SVG_CONTENT.exec(source.fileContent) || source.fileContent;
  // Use default attributes if no outer <svg> tag
  const defaultAttributes = Array.isArray(svgContent) ? {} : DEFAULT_SVG_ATTR;
  let attributes = {};
  const parser = new htmlparser.Parser(new htmlparser.DomHandler((err, dom) => {
    if (err) return next(err);

    dom = dom.filter((item) => {
      return (item.type == 'tag' && item.name == 'svg');
    });

    if (dom.length) {
      attributes = utils.parseAttributes(dom[0].attribs);
      // Fix lowercasing
      if ('viewbox' in attributes) {
        attributes.viewBox = attributes.viewbox;
        delete attributes.viewbox;
      }
    }
  }));

  // Strip xml tag
  parser.parseComplete(source.fileContent);
  source.content = Array.isArray(svgContent) ? svgContent[1] : svgContent;
  source.attributes = merge({}, defaultAttributes, attributes, source.attributes);
  source.tag = 'svg';
  // Handle subset of symbols as specified with filepath anchor (foo.svg#foo,bar)
  if (source.filepathAnchor) {
    const includedIds = source.filepathAnchor.split(',');
    let content = source.content;
    let match;

    while (match = RE_SYMBOL.exec(source.content)) {
      if (!~includedIds.indexOf(match[1])) {
        content = content.replace(match[0], '');
      }
    }

    source.content = content;
  }
  if (source.compress) {
    // svgo sometiemes throws errors if content not wrapped in <svg>, so wrap here
    const attrs = utils.getAttributeString(source.attributes, context.attribute, false);
    const content = '<svg'
      + attrs
      + '>'
      + source.content
      + '</svg>';

    // Sync api call
    svgo.optimize(content, (content) => {
      RE_SVG_CONTENT.lastIndex = 0;
      var rematch = RE_SVG_CONTENT.exec(content.data);

      if (rematch) {
        source.content = rematch[1];
      } else {
        // Error re-parsing, leave as is;
        source.replace = content.data;
      }
    });
  }
  return next();
};