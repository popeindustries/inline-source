/**
 * Parse `htmlpath` content for tags containing an `inline` attribute,
 * and replace with (optionally compressed) file contents.
 */
export function inlineSource(
  /**
   * Path to html file or raw string of html
   */
  htmlpath: string,
  options?: Options
): Promise<string>;
