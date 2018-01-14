interface Options {
  attribute: string | boolean;
  compress: boolean;
  fs: any; // like MemoryFileSystem
  handlers: [({}, {}) => Promise<any>];
  ignore: string[] | { [key: string]: string };
  pretty: boolean;
  rootpath: string;
  saveRemote: boolean;
  svgAsImage: boolean;
  swallowErrors: boolean;
}

declare function inline(htmlpath: string, options: Partial<Options>): Promise<string>;

export = inline;
