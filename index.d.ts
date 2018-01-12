interface Options {
  attribute: string | boolean;
  compress: boolean;
  fs: any; // like MemoryFileSystem
  handlers: [(object, object) => Promise];
  ignore: string[] | { [key: string]: string };
  pretty: boolean;
  rootpath: string;
  svgAsImage: boolean;
  swallowErrors: boolean;
}

declare function inline(htmlpath: string, options: Partial<Options>): Promise<string>;

export = inline;
