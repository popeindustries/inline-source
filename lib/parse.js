'use strict';

var htmlparser = require('htmlparser2');
var path = require('path');
var utils = require('./utils');

var RE_COMMENT = /(<!--[^[i][\S\s]+?--\s?>)/gm;

/**
 * Parse inlineable sources, modifying passed 'context'
 * @param {Object} context
 * @param {Function} [fn]
 */
module.exports = function parse (context, fn) {
  fn = fn || utils.noop;

  var html = context.html.replace(RE_COMMENT, '');
  var match;
  // This api uses a synchronous callback handler, so order and definition of 'match' is preserved
  var parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
    if (err) return fn(err);

    var parsed = dom[0];
    var attributes = utils.parseAttributes(parsed.attribs);
    var props = utils.parseProps(attributes, context.attribute);
    var tag = match[1];
    var type = utils.getTypeFromType(attributes.type) || utils.getTypeFromTag(match[1]);
    var filepath = utils.getSourcepath(attributes.src || attributes.href || attributes.data, context.htmlpath, context.rootpath);
    var extension = path.extname(filepath).slice(1);
    var format = utils.getFormatFromExtension(extension);

    // Ignore based on tag or type
    if (!utils.isIgnored(context.ignore, tag, type, format)) {
      context.sources.push({
        attributes: attributes,
        compress: 'compress' in props ? props.compress : context.compress,
        content: null,
        errored: false,
        extension: extension,
        fileContent: '',
        filepath: filepath,
        format: format,
        match: match[0],
        padding: context.pretty ? utils.getPadding(match[0], context.html) : '',
        parentContext: context,
        props: props,
        replace: '',
        stack: context.stack,
        svgAsImage: 'svgasimage' in props ? props.svgasimage : context.svgAsImage,
        tag: match[1],
        type: type
      });
    }
  }));

  while (match = context.re.exec(html)) {
    parser.parseComplete(match);
  }

  fn();
};