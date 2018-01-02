declare namespace inline {
	function sync(htmlpath: string, options?: Partial<Options>): void;
}

interface Options {
	compress: boolean;
	rootpath: string;
	ignore: string[] | { [key: string]: string; };
	swallowErrors: boolean;
	attribute: string | boolean;
	pretty: boolean;
	fs: any;	// like MemoryFileSystem
}

type Callback = (err: Error, html: string) => void;

declare function inline(htmlpath: string, options: Partial<Options>, fn: Callback): void;
declare function inline(htmlpath: string, fn: Callback): void;

export = inline;