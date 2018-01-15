'use strict';

const {
  getFormatFromExtension,
  getPadding,
  getSourcepath,
  getTypeFromTag,
  getTypeFromType,
  isIgnored,
  isRemoteFilepath,
  parseAttributes,
  parseProps
} = require('./utils');
const htmlparser = require('htmlparser2');
const path = require('path');

const RE_COMMENT = /(<!--[^[i][\S\s]+?--\s?>)/gm;

/**
 * Parse inlineable sources, modifying passed 'context'
 * @param {Object} context
 * @returns {Promise}
 */
module.exports = function parse(context) {
  return new Promise((resolve, reject) => {
    // Remove comments
    const html = context.html.replace(RE_COMMENT, '');
    // This api uses a synchronous callback handler, so order and definition of 'match' is preserved
    const parser = new htmlparser.Parser(
      new htmlparser.DomHandler((err, dom) => {
        if (err) {
          return reject(err);
        }

        const parsed = dom[0];
        const attributes = parseAttributes(parsed.attribs);
        const props = parseProps(attributes, context.attribute);
        const tag = match[1];
        const type = getTypeFromType(attributes.type) || getTypeFromTag(match[1]);
        const sourcepath = attributes.src || attributes.href || attributes.data;
        const filepath = getSourcepath(sourcepath, context.htmlpath, context.rootpath);
        const extension = path.extname(filepath[0]).slice(1);
        const format = getFormatFromExtension(extension);

        // Skip if no source referenced, and ignore based on tag or type
        if (!isIgnored(context.ignore, tag, type, format)) {
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
            isRemote: isRemoteFilepath(sourcepath),
            match: match[0],
            padding: context.pretty ? getPadding(match[0], context.html) : '',
            parentContext: context,
            props,
            replace: '',
            sourcepath,
            stack: context.stack,
            svgAsImage: 'svgasimage' in props ? props.svgasimage : context.svgAsImage,
            tag: match[1],
            type
          });
        }
      })
    );
    let match;

    while ((match = context.re.exec(html))) {
      parser.parseComplete(match);
    }

    resolve();
  });
};
