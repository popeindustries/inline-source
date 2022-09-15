import { css } from './css.js';
import fs from 'node:fs';
import { getTagRegExp } from './utils.js';
import { inline } from './inline.js';
import { js } from './js.js';
import { img } from './img.js';
import { load } from './load.js';
import path from 'node:path';
import { wrap } from './wrap.js';

const DEFAULT = {
  compress: true,
  fs /* Allow overriding 'fs' implementation */,
  html: '',
  htmlpath: '',
  ignore: [],
  pretty: false,
  saveRemote: true,
  swallowErrors: false,
  svgAsImage: false,
};

/**
 * Retrieve context from 'options'
 * @param { Options } options
 * @returns { Context }
 */
export function createContext(options = {}) {
  const { attribute = 'inline', handlers = [], preHandlers = [] } = options;

  /** @type { Context } */
  const context = Object.assign(
    {
      attribute,
      re: getTagRegExp(attribute),
      rootpath: process.cwd(),
      sources: [],
      stack: [...preHandlers, load, ...handlers, js, css, img, wrap, inline],
    },
    DEFAULT,
    options
  );

  if (options.rootpath) {
    context.rootpath = path.resolve(options.rootpath);
  }
  if (options.pretty == true && context.compress == false) {
    context.pretty = true;
  }

  return context;
}
