export interface Options {
  attribute: string | boolean;
  compress: boolean;
  fs: any; // like MemoryFileSystem
  preHandlers: Array<(source: any, context: any) => Promise<any>>;
  handlers: Array<(source: any, context: any) => Promise<any>>;
  ignore: Array<string> | { [key: string]: string };
  pretty: boolean;
  rootpath: string;
  saveRemote: boolean;
  svgAsImage: boolean;
  swallowErrors: boolean;
}

export function inlineSource(
  htmlpath: string,
  options?: Partial<Options>
): Promise<string>;
