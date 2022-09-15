declare type Handler = (
  source: Source,
  context: Context
) => Promise<void> | void;

declare interface Context {
  attribute: string | boolean;
  compress: boolean;
  fs: typeof import('node:fs');
  html: string;
  htmlpath: string;
  ignore: Array<string>;
  pretty: boolean;
  rootpath: string;
  re: RegExp;
  saveRemote: boolean;
  sources: Array<Source>;
  stack: Array<Handler>;
  swallowErrors: boolean;
  svgAsImage: boolean;
}

declare interface Source {
  attributes: Record<string, string | boolean>;
  compress: boolean;
  content: null | string;
  errored: boolean;
  extension: string;
  fileContent: string;
  filepath: string;
  filepathAnchor: string;
  format: string;
  isRemote: boolean;
  match: string;
  padding: string;
  parentContext: Context;
  props: Record<string, string | boolean>;
  replace: string;
  sourcepath: string | boolean;
  stack: Array<Handler>;
  svgAsImage: boolean;
  tag: string;
  type: string;
}

declare interface Options {
  attribute?: string | boolean;
  compress?: boolean;
  fs?: typeof import('node:fs');
  preHandlers?: Array<Handler>;
  handlers?: Array<Handler>;
  ignore?: Array<string> | Record<string, string>;
  pretty?: boolean;
  rootpath?: string;
  saveRemote?: boolean;
  svgAsImage?: boolean;
  swallowErrors?: boolean;
}
