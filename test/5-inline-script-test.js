'use strict';

const { expect } = require('chai');
const { inlineSource: inline } = require('..');
const fs = require('fs');
const MemoryFileSystem = require('memory-fs');
const nock = require('nock');
const path = require('path');

function normaliseNewLine(str) {
  return str.replace(/\r\n/g, '\n');
}

describe('inline <script>', () => {
  before(() => {
    process.chdir(require('path').resolve(__dirname, './fixtures'));
  });

  it('should ignore commented sources', async () => {
    const test = '<!-- <script inline src="foo.js"></script> -->';
    const html = await inline(test);
    expect(html).to.eql(test);
  });
  it('should ignore sources that don\'t contain an "inline" attribute', async () => {
    const test = '<script src="foo.js"></script>';
    const html = await inline(test);
    expect(html).to.eql(test);
  });
  it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', async () => {
    const test = '<script src="inline.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(test);
  });
  it('should inline sources that contain an "inline" attribute', async () => {
    const test = '<script inline src="foo.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources that contain an "inline=true" attribute', async () => {
    const test = '<script inline="true" src="foo.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources that contain an "inline=inline" attribute', async () => {
    const test = '<script inline="inline" src="foo.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline multiple sources that contain an "inline" attribute', async () => {
    const test = '<script inline src="foo.js"></script>\n<script inline src="bar.js"></script>';
    const html = normaliseNewLine(await inline(test, { compress: true }));
    expect(html).to.eql(
      '<script>var foo=this;console.log(foo);</script>\n<script>var bar=this;console.log(bar);</script>'
    );
  });
  it('should inline sources that contain an "inline" attribute on a line with leading whitespace', async () => {
    const test = '    <script inline src="foo.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('    <script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources that contain an "inline" attribute at the end of the <script> tag', async () => {
    const test = '<script src="foo.js" inline></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources that contain an "inline" attribute at the end of the <script> tag and the file name contains number', async () => {
    const test = '<script src="foo01.js" inline></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources that contain an "inline" attribute at the end of the <script> tag surrounded by whitespace', async () => {
    const test = '<script src="foo.js" inline ></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', async () => {
    const test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
    const html = normaliseNewLine(await inline(test, { compress: true, swallowErrors: true }));
    expect(html).to.eql(
      '<script src="baz.js"></script>\n<script>var foo=this;console.log(foo);</script>'
    );
  });
  it('should return an error when options.swallowErrors is "false"', async () => {
    const test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
    try {
      const html = await inline(test, { compress: true });
      expect(html).to.not.exist;
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });
  it('should preserve order of multiple inlined items', async () => {
    const test = '<script inline src="bar.js"></script>\n<script inline src="foo.js"></script>';
    const html = normaliseNewLine(await inline(test, { compress: true }));
    expect(html).to.eql(
      '<script>var bar=this;console.log(bar);</script>\n<script>var foo=this;console.log(foo);</script>'
    );
  });
  it('should allow specification of a custom attribute name', async () => {
    const test = '<script data-inline src="bar.js"></script>';
    const html = await inline(test, { compress: true, attribute: 'data-inline' });
    expect(html).to.eql('<script>var bar=this;console.log(bar);</script>');
  });
  it('should allow override of compression setting', async () => {
    const test = '<script inline inline-compress=false src="bar.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var bar = this;\nconsole.log(bar);</script>');
  });
  it('should load html source content if none specified', async () => {
    const html = await inline(path.resolve('test.html'));
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources referenced by relative path', async () => {
    const test = '<script inline src="./nested/foo.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources referenced by path containing query params', async () => {
    const test = '<script inline src="./nested/foo.js?foo=bar"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources referenced by absolute path relative to project directory', async () => {
    const test = '<script inline src="/nested/foo.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should inline sources referenced by absolute path relative to passed rootpath directory', async () => {
    const test = '<script inline src="/bar.js"></script>';
    const html = await inline(test, { compress: true, rootpath: path.resolve('nested/deep') });
    expect(html).to.eql('<script>var bar=this;console.log(bar);</script>');
  });
  it('should not compress inlined content when options.compressed is "false"', async () => {
    const test = '<script inline src="./nested/foo.js"></script>';
    const html = normaliseNewLine(await inline(test, { compress: false }));
    expect(html).to.eql('<script>var foo = this;\nconsole.log(foo);</script>');
  });
  it('should replace content ignoring special string.replace tokens', async () => {
    const test = '<script inline src="./nested/tokens.js"></script>';
    const html = await inline(test, { compress: false });
    expect(html).to.eql('<script>e&$&&(doSomething());</script>');
  });
  it('should not inline content when options.ignore includes "script"', async () => {
    const test = '<script inline src="./nested/foo.js"></script>';
    const html = await inline(test, { compress: true, ignore: ['script'] });
    expect(html).to.eql('<script inline src="./nested/foo.js"></script>');
  });
  it('should not inline content when options.ignore includes "js"', async () => {
    const test = '<script inline src="./nested/foo.js"></script>';
    const html = await inline(test, { compress: true, ignore: ['js'] });
    expect(html).to.eql('<script inline src="./nested/foo.js"></script>');
  });
  it('should preserve whitespace while inlining content when options.pretty is "true"', async () => {
    const html = normaliseNewLine(
      await inline(path.resolve('multiline.html'), { pretty: true, compress: false })
    );
    expect(html).to.eql(`<!DOCTYPE html>
<html>
<head>
  <title></title>
  <script>
  var foo = 'foo'
    , bar = 'bar';

  function baz () {
    console.log(foo, bar);
  }

  baz();
  </script>
</head>
<body>

</body>
</html>`);
  });
  it('should parse html templates for inlineable content', async () => {
    const html = normaliseNewLine(await inline(path.resolve('head.nunjs')));
    expect(html).to.eql(`<head>
  <meta charset="utf-8">
  <title>{{ title }}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />

  {% if js %}
    <script>var foo=this;console.log(foo);</script>
  {% endif %}

  <link rel="stylesheet" href={{ assets['index.css'] }}>

</head>`);
  });
  it('should inline sources from memory file system.', async () => {
    const cwd = process.cwd();
    const mfs = new MemoryFileSystem();
    const test = '<script src="memory.js" inline ></script>';

    mfs.mkdirpSync(cwd);
    mfs.writeFileSync(`${cwd}/memory.js`, 'console.log(123);', 'utf8');

    const html = await inline(test, { compress: true, fs: mfs });
    expect(html).to.eql('<script>console.log(123);</script>');
  });
  it('should inline all sources when attribute=false', async () => {
    const test = '<script src="foo.js"></script>';
    const html = await inline(test, { attribute: false, compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
  it('should not inline all sources when attribute=false and missing src', async () => {
    const test = '<script>var foo="foo";</script>';
    const html = await inline(test, { attribute: false, compress: true });
    expect(html).to.eql('<script>var foo="foo";</script>');
  });
  it('should throw on compression error', async () => {
    const test = '<script src="es6.js" inline></script>';
    try {
      const html = await inline(test, { compress: true });
      expect(html).to.not.exist;
    } catch (err) {
      expect(err.message).to.eql('Unexpected token: keyword (const)');
    }
  });
  it('should inline remote sources', async () => {
    nock('https://cdnjs.cloudflare.com')
      .get('/ajax/libs/preact/8.2.7/preact.min.js')
      .reply(200, 'preact;');
    const test =
      '<script inline src="https://cdnjs.cloudflare.com/ajax/libs/preact/8.2.7/preact.min.js"></script>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<script>preact;</script>');
    expect(fs.existsSync(path.resolve('ajax_libs_preact_8.2.7_preact.min.js'))).to.equal(true);
    fs.unlinkSync(path.resolve('ajax_libs_preact_8.2.7_preact.min.js'));
  });
  it('should not save a copy of an inlined remote source when options.saveRemote is "false"', async () => {
    nock('https://cdnjs.cloudflare.com')
      .get('/ajax/libs/preact/8.2.7/preact.min.js')
      .reply(200, 'preact;');
    const test =
      '<script inline src="https://cdnjs.cloudflare.com/ajax/libs/preact/8.2.7/preact.min.js"></script>';
    const html = await inline(test, { compress: true, saveRemote: false });
    expect(html).to.eql('<script>preact;</script>');
    expect(fs.existsSync(path.resolve('ajax_libs_preact_8.2.7_preact.min.js'))).to.equal(false);
  });
  it('should remove the "inline" attribute for remote sources that can\'t be found when options.swallowErrors is "true"', async () => {
    nock('https://cdnjs.cloudflare.com')
      .get('/ajax/libs/preact/8.2.7/preact.min.js')
      .reply(404);
    const test =
      '<script inline src="https://cdnjs.cloudflare.com/ajax/libs/preact/8.2.7/preact.min.js"></script>';
    const html = await inline(test, { compress: true, swallowErrors: true });
    expect(html).to.eql(
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/preact/8.2.7/preact.min.js"></script>'
    );
  });
  it('should throw on error inlining remote sources', async () => {
    nock('https://cdnjs.cloudflare.com')
      .get('/blah.js')
      .reply(404);
    const test = '<script inline src="https://cdnjs.cloudflare.com/blah.js"></script>';
    try {
      const html = await inline(test, { compress: true });
      expect(html).to.not.exist;
    } catch (err) {
      expect(err.message).to.eql('Not Found');
    }
  });
});
