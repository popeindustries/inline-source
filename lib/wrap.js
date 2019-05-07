'use strict';

const { getAttributeString } = require('./utils');

const RE_BEGIN_LINE = /^./gm;

/**
 * Wrap source content
 * @param {Object} source
 * @param {Object} context
 * @returns {Promise}
 */
module.exports = function wrap(source, context) {
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

  return Promise.resolve();
};
