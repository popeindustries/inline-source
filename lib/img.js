'use strict';

var htmlparser = require('htmlparser2');
var merge = require('lodash/merge');
var Svgo = require('svgo');
var utils = require('./utils');

var DEFAULT_SVG_ATTR = {
  x: '0',
  y: '0',
  viewBox: '0 0 100 100'
};
var RE_SVG_CONTENT = /<svg[^>]+>([\S\s]*?)<\/\s?svg>/gm;
var RE_XML_TAG = /<\?xml.+?\?>\s+/g;

var svgo = new Svgo({
  plugins: [
    // Prevent removal of unused <symbol> elements
    { cleanupIDs: false },
    // Prevent removal of xlink:href on <image> elements
    { removeEmptyAttrs: false },
    { removeUselessDefs: false },
    // Prevent removal of <image> src attribute
    { removeUnknownsAndDefaults: false }
  ]
});

/**
 * Handle IMG content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 * @returns {null}
 */
module.exports = function img (source, context, next) {
  // Handle sync
  next = next || utils.noop;

  if (source.fileContent
    && !source.content
    && (source.type == 'image')) {
      var attributeType = source.attributes.type;
      var strict = !source.errored;
      var sourceProp = 'src';
      var data, encoding, src;

      delete source.attributes.type;

      // svg
      if (source.format == 'svg+xml') {
        if (!source.svgAsImage) {
          RE_SVG_CONTENT.lastIndex = 0;

          var attributes = {};
          var match = RE_SVG_CONTENT.exec(source.fileContent);
          var parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
            if (err) return next(err);

            dom = dom.filter(function (item) {
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
            var attrs = utils.getAttributeString(source.attributes, context.attribute, false);
            var content = '<svg'
              + attrs
              + '>'
              + source.content
              + '</svg>';

            // Sync api call
            svgo.optimize(content, function (content) {
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
        } else {
          source.tag = 'img';
          // Strip xml tag
          source.content = source.fileContent.replace(RE_XML_TAG, '');
          if (source.compress) {
            // Sync api call
            svgo.optimize(source.content, function (content) {
              source.content = content.data;
            });
          }
          data = encodeURIComponent(source.content);
          encoding = 'utf8';
        }

      // gif/png/jpeg
      } else {
        data = new Buffer(source.fileContent).toString('base64');
        encoding = 'base64';

        // Favicon
        if (source.tag == 'link') {
          source.attributes.type = attributeType;
          sourceProp = 'href';
          strict = false;
          delete source.attributes.href;
        }
      }

      var attrs = utils.getAttributeString(source.attributes, context.attribute, strict);

      src = 'data:image/' + source.format + ';' + encoding + ',' + data;
      attrs += ' ' + sourceProp + '="' + src + '"';
      source.content = src;
      source.replace = '<'
        + source.tag
        + attrs
        + ' />';

      next();
  } else {
    next();
  }
};