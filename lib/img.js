'use strict';

const imgSVG = require('./imgSVG.js');
const utils = require('./utils');

const RE_XML_TAG = /<\?xml.+?\?>\s+/g;

let svgo;

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

  if (source.fileContent && !source.content && (source.type == 'image')) {
    const attributeType = source.attributes.type;
    let strict = !source.errored;
    let sourceProp = 'src';
    let data, encoding;

    delete source.attributes.type;

    // svg
    if (source.format == 'svg+xml') {
      // Init compressor
      if (source.compress && !svgo) {
        const Svgo = require('svgo');

        svgo = new Svgo({
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
      }
      if (!source.svgAsImage) return imgSVG(source, context, svgo, next);

      source.tag = 'img';
      // Strip xml tag
      source.content = source.fileContent.replace(RE_XML_TAG, '');
      if (source.compress) {
        // Sync api call
        svgo.optimize(source.content, (content) => {
          source.content = content.data;
        });
      }
      data = encodeURIComponent(source.content);
      encoding = 'utf8';

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

    const src = 'data:image/' + source.format + ';' + encoding + ',' + data;
    let attrs = utils.getAttributeString(source.attributes, context.attribute, strict);

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