'use strict';

const assign = require('object-assign');
const css = require('./css');
const fs = require('fs');
const inline = require('./inline');
const js = require('./js');
const img = require('./img');
const load = require('./load');
const path = require('path');
const utils = require('./utils');
const wrap = require('./wrap');

const DEFAULT = {
  attribute: 'inline',
  compress: true,
  ignore: [],
  pretty: false,
  swallowErrors: false,
  svgAsImage: false
};

/**
 * Retrieve context from 'options'
 * @param {Object} options
 *  - {String} attribute
 *  - {Boolean} compress
 *  - {Object} fs
 *  - {Array} handlers
 *  - {Array} ignore
 *  - {Boolean} pretty
 *  - {String} rootpath
 *  - {Boolean} swallowErrors
 *  - {Boolean} svgAsImage
 * @returns {Object}
 */
exports.create = function create(options) {
  options = options || {};

  const context = assign(
    {
      // Allow overriding 'fs' implementation
      fs,
      html: '',
      htmlpath: '',
      rootpath: process.cwd(),
      sources: []
    },
    DEFAULT,
    options
  );

  if (options.rootpath) context.rootpath = path.resolve(options.rootpath);
  if (options.pretty == true && context.compress == false) context.pretty = true;
  context.re = utils.getTagRegExp(context.attribute);
  // Prepare stack
  context.stack = [load];
  if (options.handlers) context.stack = context.stack.concat(options.handlers);
  context.stack.push(js, css, img, wrap, inline);

  return context;
};
