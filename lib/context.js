'use strict';

var assign = require('lodash/assign');
var css = require('./css');
var inline = require('./inline');
var js = require('./js');
var img = require('./img');
var load = require('./load');
var path = require('path');
var utils = require('./utils');
var wrap = require('./wrap');

var DEFAULT = {
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
 * @returns {Object}
 */
exports.create = function (options) {
  options = options || {};

  var context = assign({
    html: '',
    htmlpath: '',
    rootpath: process.cwd(),
    sources: []
  }, DEFAULT, options);

  if (options.rootpath) context.rootpath = path.resolve(options.rootpath);
  if (options.pretty == true && context.compress == false) context.pretty = true;
  context.re = utils.getTagRegExp(context.attribute);
  // Prepare stack
  context.stack = [load];
  if (options.handlers) context.stack = context.stack.concat(options.handlers);
  context.stack.push(js, css, img, wrap, inline);

  return context;
};