'use strict';

var assign = require('lodash/assign')
  , css = require('./css')
  , inline = require('./inline')
  , js = require('./js')
  , img = require('./img')
  , load = require('./load')
  , path = require('path')
  , utils = require('./utils')
  , wrap = require('./wrap')

  , DEFAULT = {
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