'use strict';

const htmlparser = require('htmlparser2');
const path = require('path');
const utils = require('./utils');

const RE_COMMENT = /(<!--[^[i][\S\s]+?--\s?>)/gm;

/**
 * Parse inlineable sources, modifying passed 'context'
 * @param {Object} context
 * @param {Function} [fn]
 */
module.exports = function parse (context, fn) {
  fn = fn || utils.noop;

  const html = context.html.replace(RE_COMMENT, '');
  // This api uses a synchronous callback handler, so order and definition of 'match' is preserved
  const parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
    if (err) return fn(err);

    const parsed = dom[0];
    const attributes = utils.parseAttributes(parsed.attribs);
    const props = utils.parseProps(attributes, context.attribute);
    const tag = match[1];
    const type = utils.getTypeFromType(attributes.type) || utils.getTypeFromTag(match[1]);
    const filepath = utils.getSourcepath(attributes.src || attributes.href || attributes.data, context.htmlpath, context.rootpath);
    const extension = path.extname(filepath[0]).slice(1);
    const format = utils.getFormatFromExtension(extension);

    // Ignore based on tag or type
    if (!utils.isIgnored(context.ignore, tag, type, format)) {
      context.sources.push({
        attributes,
        compress: 'compress' in props ? props.compress : context.compress,
        content: null,
        errored: false,
        extension,
        fileContent: '',
        filepath: filepath[0],
        filepathAnchor: filepath[1],
        format,
        match: match[0],
        padding: context.pretty ? utils.getPadding(match[0], context.html) : '',
        parentContext: context,
        props,
        replace: '',
        stack: context.stack,
        svgAsImage: 'svgasimage' in props ? props.svgasimage : context.svgAsImage,
        tag: match[1],
        type
      });
    }
  }));
  let match;

  while (match = context.re.exec(html)) {
    parser.parseComplete(match);
  }

  fn();
};