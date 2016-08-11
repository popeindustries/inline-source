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

  const match = RE_SVG_CONTENT.exec(source.fileContent);
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
  source.content = match ? match[1] : source.fileContent;
  source.attributes = merge({}, DEFAULT_SVG_ATTR, attributes, source.attributes);
  source.tag = 'svg';
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