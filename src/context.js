import { css } from './css.js';
import fs from 'fs';
import { getTagRegExp } from './utils.js';
import { inline } from './inline.js';
import { js } from './js.js';
import { img } from './img.js';
import { load } from './load.js';
import path from 'path';
import { wrap } from './wrap.js';

const DEFAULT = {
  attribute: 'inline',
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
 * @param { object } options
 * @param { String } options.attribute
 * @param { boolean } options.compress
 * @param { object } options.fs
 * @param { Array<(source: any, context: any) => Promise<any>> } options.preHandlers
 * @param { Array<(source: any, context: any) => Promise<any>> } options.handlers
 * @param { Array<string> | { [key: string]: string } } options.ignore
 * @param { boolean } options.pretty
 * @param { string } options.rootpath
 * @param { boolean } options.saveRemote
 * @param { boolean } options.swallowErrors
 * @param { boolean } options.svgAsImage
 * @returns { object }
 */
export function createContext(options = {}) {
  const { handlers = [], preHandlers = [] } = options;
  const context = Object.assign(
    {
      rootpath: process.cwd(),
      sources: [],
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
  context.re = getTagRegExp(context.attribute);
  context.stack = [
    ...preHandlers,
    load,
    ...handlers,
    js,
    css,
    img,
    wrap,
    inline,
  ];

  return context;
}
