import { expect } from 'chai';
import { fileURLToPath } from 'node:url';
import { inlineSource } from '../src/index.js';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normaliseNewLine(str) {
  return str.replace(/\r\n/g, '\n');
}

describe('inline <object>', () => {
  before(function () {
    process.chdir(path.resolve(__dirname, './fixtures'));
  });

  it('should inline svg sources that contain an "inline" attribute', async () => {
    const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';
    const html = normaliseNewLine(
      await inlineSource(test, { compress: false }),
    );
    expect(html).to
      .eql(`<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200">
<circle cx="50" cy="50" r="25"/>
</svg>`);
  });
  it('should inline svg sources that contain an "inline" attribute, preserving other attributes', async () => {
    const test =
      '<object inline id="foo" class="foo bar" type="image/svg+xml" data="foo.svg"></object>';
    const html = normaliseNewLine(
      await inlineSource(test, { compress: false }),
    );
    expect(html).to
      .eql(`<svg id="foo" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200" class="foo bar">
<circle cx="50" cy="50" r="25"/>
</svg>`);
  });
  it('should inline compressed svg sources with options.compressed="true"', async () => {
    const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';
    const html = await inlineSource(test, { compress: true });
    expect(html).to.eql(
      '<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200"><circle cx="50" cy="50" r="25"/></svg>',
    );
  });
  it('should inline svg sources as base64 if options.svgAsImage="true"', async () => {
    const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';
    const html = await inlineSource(test, { svgAsImage: true, compress: true });
    expect(html).to.contain('<img src="data:image/svg+xml;charset=utf8');
  });
  it('should inline svg sources as base64 if svgAsImage="true"', async () => {
    const test =
      '<object inline inline-svgAsImage type="image/svg+xml" data="foo.svg"></object>';
    const html = await inlineSource(test, { compress: true });
    expect(html).to.contain('<img src="data:image/svg+xml;charset=utf8');
  });
});
