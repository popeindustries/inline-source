'use strict';

const eol = require('os').EOL;
const expect = require('expect.js');
const inline = require('..');
const inlineSync = require('..').sync;
const path = require('path');

describe('inline', function () {
  before(function () {
    process.chdir('./test/fixtures');
  });

  describe('<script>', function () {
    describe('async', function () {
      it('should ignore commented sources', function (done) {
        const test = '<!-- <script inline src="foo.js"></script> -->';

        inline(test, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql(test);
          done();
        });
      });
      it('should ignore sources that don\'t contain an "inline" attribute', function (done) {
        const test = '<script src="foo.js"></script>';

        inline(test, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql(test);
          done();
        });
      });
      it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function (done) {
        const test = '<script src="inline.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql(test);
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute', function (done) {
        const test = '<script inline src="foo.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline sources that contain an "inline=true" attribute', function (done) {
        const test = '<script inline="true" src="foo.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline sources that contain an "inline=inline" attribute', function (done) {
        const test = '<script inline="inline" src="foo.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline multiple sources that contain an "inline" attribute', function (done) {
        const test = '<script inline src="foo.js"></script>' + eol + '<script inline src="bar.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>' + eol + '<script>var bar=this;console.log(bar);</script>');
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function (done) {
        const test = '    <script inline src="foo.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('    <script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute at the end of the <script> tag', function (done) {
        const test = '<script src="foo.js" inline></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute at the end of the <script> tag and the file name contains number', function (done) {
        const test = '<script src="foo01.js" inline></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute at the end of the <script> tag surrounded by whitespace', function (done) {
        const test = '<script src="foo.js" inline ></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function (done) {
        const test = '<script inline src="baz.js"></script>' + eol + '<script inline src="foo.js"></script>';

        inline(test, { compress: true, swallowErrors: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script src="baz.js"></script>' + eol + '<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should return an error when options.swallowErrors is "false"', function (done) {
        const test = '<script inline src="baz.js"></script>' + eol + '<script inline src="foo.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be.an(Error);
          done();
        });
      });
      it('should preserve order of multiple inlined items', function (done) {
        const test = '<script inline src="bar.js"></script>' + eol + '<script inline src="foo.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var bar=this;console.log(bar);</script>' + eol + '<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should allow specification of a custom attribute name', function (done) {
        const test = '<script data-inline src="bar.js"></script>';

        inline(test, { compress: true, attribute: 'data-inline' }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var bar=this;console.log(bar);</script>');
          done();
        });
      });
      it('should load html source content if none specified', function (done) {
        inline(path.resolve('test.html'), function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline sources referenced by relative path', function (done) {
        const test = '<script inline src="./nested/foo.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline sources referenced by absolute path relative to project directory', function (done) {
        const test = '<script inline src="/nested/foo.js"></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
          done();
        });
      });
      it('should inline sources referenced by absolute path relative to passed rootpath directory', function (done) {
        const test = '<script inline src="/bar.js"></script>';

        inline(test, { compress: true, rootpath: path.resolve('nested/deep') }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var bar=this;console.log(bar);</script>');
          done();
        });
      });
      it('should not compress inlined content when options.compressed is "false"', function (done) {
        const test = '<script inline src="./nested/foo.js"></script>';

        inline(test, { compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>var foo = this;' + eol + 'console.log(foo);</script>');
          done();
        });
      });
      it('should replace content ignoring special string.replace tokens', function (done) {
        const test = '<script inline src="./nested/tokens.js"></script>';

        inline(test, { compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>e&$&&(doSomething());</script>');
          done();
        });
      });
      it('should not inline content when options.ignore includes "script"', function (done) {
        const test = '<script inline src="./nested/foo.js"></script>';

        inline(test, { compress: true, ignore: ['script'] }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script inline src="./nested/foo.js"></script>');
          done();
        });
      });
      it('should not inline content when options.ignore includes "js"', function (done) {
        const test = '<script inline src="./nested/foo.js"></script>';

        inline(test, { compress: true, ignore: ['js'] }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script inline src="./nested/foo.js"></script>');
          done();
        });
      });
      it('should not inline content when v3.x style options.ignore.type includes "js"', function (done) {
        const test = '<script inline src="./nested/foo.js"></script>';

        inline(test, { compress: true, ignore: { type: ['js'] } }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script inline src="./nested/foo.js"></script>');
          done();
        });
      });
      it('should not inline content when v3.x style options.ignore.tag includes "script"', function (done) {
        const test = '<script inline src="./nested/foo.js"></script>';

        inline(test, { compress: true, ignore: { tag: 'script' } }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script inline src="./nested/foo.js"></script>');
          done();
        });
      });
      it('should preserve whitespace while inlining content when options.pretty is "true"', function (done) {
        inline(path.resolve('multiline.html'), { pretty: true, compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<!DOCTYPE html>' + eol + '<html>' + eol + '<head>' + eol + '  <title></title>' + eol + '  <script>' + '\n' + '  var foo = \'foo\'' + eol + '    , bar = \'bar\';' + eol + eol + '  function baz () {' + eol + '    console.log(foo, bar);' + eol + '  }' + eol + eol + '  baz();' + '\n' + '  </script>' + eol + '</head>' + eol + '<body>' + eol + eol + '</body>' + eol + '</html>');
          done();
        });
      });
      it('should parse html templates for inlineable content', function (done) {
        inline(path.resolve('head.nunjs'), function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<head>' + eol + '  <meta charset="utf-8">' + eol + '  <title>{{ title }}</title>' + eol + '  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />' + eol + eol + '  {% if js %}' + eol + '    <script>var foo=this;console.log(foo);</script>' + eol + '  {% endif %}' + eol + eol + '  <link rel="stylesheet" href={{ assets[\'index.css\'] }}>' + eol + eol + '</head>');
          done();
        });
      });
      it('should escape closing <script> tags in content', function (done) {
        const test = '<script src="scriptTag.js" inline></script>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.equal('<script>var foo="foo";document.write(\'<script>document.title="\'+foo+\'"\\x3C/script>\');</script>');
          done();
        });
      });
    });

    describe('sync', function () {
      it('should ignore commented sources', function () {
        const test = '<!-- <script inline src="foo.js"></script> -->';
        const html = inlineSync(test);

        expect(html).to.eql(test);
      });
      it('should inline sources that contain an "inline" attribute', function () {
        const test = '<script inline src="foo.js"></script>';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
      });
      it('should inline multiple sources that contain an "inline" attribute', function () {
        const test = '<script inline src="foo.js"></script>' + eol + '<script inline src="bar.js"></script>';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql('<script>var foo=this;console.log(foo);</script>' + eol + '<script>var bar=this;console.log(bar);</script>');
      });
      it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function () {
        const test = '<script inline src="baz.js"></script>' + eol + '<script inline src="foo.js"></script>';
        const html = inlineSync(test, { compress: true, swallowErrors: true });

        expect(html).to.eql('<script src="baz.js"></script>' + eol + '<script>var foo=this;console.log(foo);</script>');
      });
      it('should return an error when options.swallowErrors is "false"', function () {
        const test = '<script inline src="baz.js"></script>' + eol + '<script inline src="foo.js"></script>';

        try {
          const html = inlineSync(test, { compress: true });

          expect(html).to.be(null);
        } catch (err) {
          expect(err).to.be.an(Error);
        }
      });
      it('should preserve order of multiple inlined items', function () {
        const test = '<script inline src="bar.js"></script>' + eol + '<script inline src="foo.js"></script>';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql('<script>var bar=this;console.log(bar);</script>' + eol + '<script>var foo=this;console.log(foo);</script>');
      });
      it('should load html source content if none specified', function () {
        const html = inlineSync(path.resolve('test.html'));

        expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
      });
      it('should parse html templates for inlineable content', function () {
        const html = inlineSync(path.resolve('head.nunjs'));

        expect(html).to.eql('<head>' + eol + '  <meta charset="utf-8">' + eol + '  <title>{{ title }}</title>' + eol + '  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />' + eol + eol + '  {% if js %}' + eol + '    <script>var foo=this;console.log(foo);</script>' + eol + '  {% endif %}' + eol + eol + '  <link rel="stylesheet" href={{ assets[\'index.css\'] }}>' + eol + eol + '</head>');
      });
    });
  });

  describe('<link>', function () {
    describe('async', function () {
      it('should ignore commented sources', function (done) {
        const test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql(test);
          done();
        });
      });
      it('should ignore sources that don\'t contain an "inline" attribute', function (done) {
        const test = '<link rel="stylesheet" href="foo.js">';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql(test);
          done();
        });
      });
      it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function (done) {
        const test = '<link rel="stylesheet" href="inline.js">';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql(test);
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute', function (done) {
        const test = '<link inline rel="stylesheet" href="foo.css">';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<style>body{background-color:#fff}</style>');
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function (done) {
        const test = '    <link inline rel="stylesheet" href="foo.css">';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('    <style>body{background-color:#fff}</style>');
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute at the end of the <link> tag', function (done) {
        const test = '<link rel="stylesheet" href="foo.css" inline>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<style>body{background-color:#fff}</style>');
          done();
        });
      });
      it('should inline sources that contain an "inline" attribute at the end of the <link> tag surrounded by whitespace', function (done) {
        const test = '<link rel="stylesheet" href="foo.css" inline >';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<style>body{background-color:#fff}</style>');
          done();
        });
      });
      it('should inline favicon sources', function (done) {
        const test = '<link rel="icon" type="image/png" href="foo.png" inline >';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<link rel="icon" type="image/png" href="data:image/png;base64,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" />');
          done();
        });
      });
      it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function (done) {
        const test = '<link inline rel="stylesheet" href="bar.css">';

        inline(test, { compress: true, swallowErrors: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<link rel="stylesheet" href="bar.css">');
          done();
        });
      });
      it('should not inline content when options.ignore includes "link"', function (done) {
        const test = '<link inline rel="stylesheet" href="foo.css">';

        inline(test, { compress: true, ignore: 'link' }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<link inline rel="stylesheet" href="foo.css">');
          done();
        });
      });
      it('should not inline content when options.ignore includes "css"', function (done) {
        const test = '<link inline rel="stylesheet" href="foo.css">';

        inline(test, { compress: true, ignore: 'css' }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<link inline rel="stylesheet" href="foo.css">');
          done();
        });
      });
    });

    describe('sync', function () {
      it('should ignore commented sources', function () {
        const test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql(test);
      });
      it('should inline sources that contain an "inline" attribute', function () {
        const test = '<link inline rel="stylesheet" href="foo.css">';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql('<style>body{background-color:#fff}</style>');
      });
      it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function () {
        const test = '<link inline rel="stylesheet" href="bar.css">';
        const html = inlineSync(test, { compress: true, swallowErrors: true });

        expect(html).to.eql('<link rel="stylesheet" href="bar.css">');
      });
    });
  });

  describe('<img>', function () {
    describe('async', function () {
      it('should ignore commented sources', function (done) {
        const test = '<!-- <img inline src="foo.png" /> -->';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql(test);
          done();
        });
      });
      it('should not inline content when options.ignore includes "svg"', function (done) {
        const test = '<img inline src="foo.svg" />';

        inline(test, { compress: true, ignore: ['svg'] }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<img inline src="foo.svg" />');
          done();
        });
      });
      it('should inline png sources that contain an "inline" attribute', function (done) {
        const test = '<img id="foo" inline src="foo.png" />';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<img id="foo" src="data:image/png;base64,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" />');
          done();
        });
      });
      it('should inline svg sources that contain an "inline" attribute', function (done) {
        const test = '<img inline src="foo.svg" />';

        inline(test, { compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200">' + eol + '<circle cx="50" cy="50" r="25"/>' + eol + '</svg>');
          done();
        });
      });
      it('should inline svg sources that contain an "inline" attribute and line break in <svg> tag', function (done) {
        const test = '<img inline src="bar.svg" />';

        inline(test, { compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg id="bar" x="0px" y="0px" xml:space="preserve" viewBox="0 0 100 36">' + eol + '<rect y="0.7" width="12.3" height="35.1"/>' + eol + '</svg>');
          done();
        });
      });
      it('should inline svg sources that contain an "inline" attribute, preserving other attributes', function (done) {
        const test = '<img id="foo" class="foo bar" inline src="foo.svg" />';

        inline(test, { compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg id="foo" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200" class="foo bar">' + eol + '<circle cx="50" cy="50" r="25"/>' + eol + '</svg>');
          done();
        });
      });
      it('should inline svg sources that contain an "inline" attribute, preserving nested "src" attributes', function (done) {
        const test = '<img id="boo" inline src="boo.svg" />';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.contain('<image src="boo.png" xlink:href=""/>');
          done();
        });
      });
      it('should inline compressed svg sources with options.compressed="true"', function (done) {
        const test = '<img inline src="foo.svg" />';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200"><circle cx="50" cy="50" r="25"/></svg>');
          done();
        });
      });
      it('should inline compressed svg symbol sources with options.compressed="true"', function (done) {
        const test = '<img inline src="foo-symbol.svg" />';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg x="0" y="0" viewBox="0 0 100 100"><symbol id="foo"><circle cx="50" cy="50" r="30"/></symbol></svg>');
          done();
        });
      });
      it('should inline svg sources as base64 if options.svgAsImage="true"', function (done) {
        const test = '<img inline src="foo.svg" />';

        inline(test, { svgAsImage: true, compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.contain('<img src="data:image/svg+xml;utf8');
          done();
        });
      });
      it('should inline svg sources as base64 if svgAsImage="true"', function (done) {
        const test = '<img inline inline-svgAsImage src="foo.svg" />';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.contain('<img src="data:image/svg+xml;utf8');
          done();
        });
      });
      it('should inline svg sources fragments', function (done) {
        const test = '<img inline src="symbols.svg#icon-close,icon-minus,icon-plus" />';

        inline(test, { compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg id="symbols" style="display:none;">' + eol + '  <symbol id="icon-close">' + eol + '    <polygon points="80.76,24.19 75.81,19.24 50,45.05 24.19,19.24 19.24,24.19 45.05,50 19.24,75.81 24.19,80.76 50,54.95 75.81,80.76 80.76,75.81 54.95,50 "/>' + eol + '  </symbol>' + eol + '  ' + eol + '  <symbol id="icon-minus">' + eol + '      <rect x="10" y="46.5" width="80" height="7"/>' + eol + '  </symbol>' + eol + '  <symbol id="icon-plus">' + eol + '    <polygon points="90,46.5 53.5,46.5 53.5,10 46.5,10 46.5,46.5 10,46.5 10,53.5 46.5,53.5 46.5,90 53.5,90 53.5,53.5 90,53.5 "/>' + eol + '  </symbol>' + eol + '  ' + eol + '  ' + eol + '</svg>');
          done();
        });
      });
    });

    describe('sync', function () {
      it('should ignore commented sources', function () {
        const test = '<!-- <img inline src="foo.png" /> -->';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql(test);
      });
      it('should inline png sources that contain an "inline" attribute', function () {
        const test = '<img inline src="foo.png" />';
        const html = inlineSync(test, { compress: true });

        expect(html).to.contain('<img src="data:image/png;base64');
      });
      it('should inline svg sources that contain an "inline" attribute', function () {
        const test = '<img inline src="foo.svg" />';
        const html = inlineSync(test, { compress: false });

        expect(html).to.eql('<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200">' + eol + '<circle cx="50" cy="50" r="25"/>' + eol + '</svg>');
      });
      it('should inline svg sources that contain an "inline" attribute and line break in <svg> tag', function () {
        const test = '<img inline src="bar.svg" />';
        const html = inlineSync(test, { compress: false });

        expect(html).to.eql('<svg id="bar" x="0px" y="0px" xml:space="preserve" viewBox="0 0 100 36">' + eol + '<rect y="0.7" width="12.3" height="35.1"/>' + eol + '</svg>');
      });
      it('should inline svg sources that contain an "inline" attribute, preserving other attributes', function () {
        const test = '<img id="foo" class="foo bar" inline src="foo.svg" />';
        const html = inlineSync(test, { compress: false });

        expect(html).to.eql('<svg id="foo" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200" class="foo bar">' + eol + '<circle cx="50" cy="50" r="25"/>' + eol + '</svg>');
      });
      it('should inline compressed svg sources with options.compressed="true"', function () {
        const test = '<img inline src="foo.svg" />';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql('<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200"><circle cx="50" cy="50" r="25"/></svg>');
      });
      it('should inline compressed svg symbol sources with options.compressed="true"', function () {
        const test = '<img inline src="foo-symbol.svg" />';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql('<svg x="0" y="0" viewBox="0 0 100 100"><symbol id="foo"><circle cx="50" cy="50" r="30"/></symbol></svg>');
      });
      it('should inline svg sources as base64 if options.svgAsImage="true"', function () {
        const test = '<img inline src="foo.svg" />';
        const html = inlineSync(test, { svgAsImage: true, compress: true });

        expect(html).to.contain('<img src="data:image/svg+xml;utf8');
      });
      it('should inline svg sources as base64 if svgAsImage="true"', function () {
        const test = '<img inline inline-svgAsImage src="foo.svg" />';
        const html = inlineSync(test, { compress: true });

        expect(html).to.contain('<img src="data:image/svg+xml;utf8');
      });
    });
  });

  describe('<object>', function () {
    describe('async', function () {
      it('should inline svg sources that contain an "inline" attribute', function (done) {
        const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';

        inline(test, { compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200">' + eol + '<circle cx="50" cy="50" r="25"/>' + eol + '</svg>');
          done();
        });
      });
      it('should inline svg sources that contain an "inline" attribute, preserving other attributes', function (done) {
        const test = '<object inline id="foo" class="foo bar" type="image/svg+xml" data="foo.svg"></object>';

        inline(test, { compress: false }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg id="foo" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200" class="foo bar">' + eol + '<circle cx="50" cy="50" r="25"/>' + eol + '</svg>');
          done();
        });
      });
      it('should inline compressed svg sources with options.compressed="true"', function (done) {
        const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200"><circle cx="50" cy="50" r="25"/></svg>');
          done();
        });
      });
      it('should inline svg sources as base64 if options.svgAsImage="true"', function (done) {
        const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';

        inline(test, { svgAsImage: true, compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.contain('<img src="data:image/svg+xml;utf8');
          done();
        });
      });
      it('should inline svg sources as base64 if svgAsImage="true"', function (done) {
        const test = '<object inline inline-svgAsImage type="image/svg+xml" data="foo.svg"></object>';

        inline(test, { compress: true }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.contain('<img src="data:image/svg+xml;utf8');
          done();
        });
      });
    });
    describe('sync', function () {
      it('should inline svg sources that contain an "inline" attribute', function () {
        const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';
        const html = inlineSync(test, { compress: false });

        expect(html).to.eql('<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200">' + eol + '<circle cx="50" cy="50" r="25"/>' + eol + '</svg>');
      });
      it('should inline svg sources that contain an "inline" attribute, preserving other attributes', function () {
        const test = '<object inline id="foo" class="foo bar" type="image/svg+xml" data="foo.svg"></object>';
        const html = inlineSync(test, { compress: false });

        expect(html).to.eql('<svg id="foo" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200" class="foo bar">' + eol + '<circle cx="50" cy="50" r="25"/>' + eol + '</svg>');
      });
      it('should inline compressed svg sources with options.compressed="true"', function () {
        const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';
        const html = inlineSync(test, { compress: true });

        expect(html).to.eql('<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200"><circle cx="50" cy="50" r="25"/></svg>');
      });
      it('should inline svg sources as base64 if options.svgAsImage="true"', function () {
        const test = '<object inline type="image/svg+xml" data="foo.svg"></object>';
        const html = inlineSync(test, { svgAsImage: true, compress: true });

        expect(html).to.contain('<img src="data:image/svg+xml;utf8');
      });
      it('should inline svg sources as base64 if svgAsImage="true"', function () {
        const test = '<object inline inline-svgAsImage type="image/svg+xml" data="foo.svg"></object>';
        const html = inlineSync(test, { compress: true });

        expect(html).to.contain('<img src="data:image/svg+xml;utf8');
      });

    });
  });

  describe('<custom>', function () {
    describe('async', function () {
      it('should ignore tag types with no handler', function (done) {
        const test = '<foo inline></foo>';

        inline(test, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql(test);
          done();
        });
      });
      it('should inline sources for custom tags and custom handler', function (done) {
        const test = '<foo inline></foo>';

        inline(test, {handlers: function (source, context, next) {
          if (source.tag == 'foo') source.content = 'foo';
          next();
        }}, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<foo>foo</foo>');
          done();
        });
      });
      it('should inline sources with overridden js handler', function (done) {
        const test = '<script src="foo.js" inline></script>';

        inline(test, {handlers: function (source, context, next) {
          if (source.type == 'js') source.content = 'foo';
          next();
        }}, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script>foo</script>');
          done();
        });
      });
      it('should inline sources with custom handler and special props', function (done) {
        const test = '<script type="application/json" src="foo.json" inline inline-var="window.foo"></script>';

        inline(test, { handlers: function (source, context, next) {
          if (source.type == 'json') source.content = source.props.var + ' = ' + source.fileContent;
          next();
        } }, function (err, html) {
          expect(err).to.be(null);
          expect(html).to.eql('<script type="application/json">window.foo = {' + eol + '  "foo": "foo"' + eol + '}</script>');
          done();
        });
      });
    });

    describe('sync', function () {
      it('should ignore tag types with no handler', function () {
        const test = '<foo inline></foo>';
        const html = inlineSync(test);

        expect(html).to.eql(test);
      });
      it('should inline sources for custom tags and custom handler', function () {
        const test = '<foo inline></foo>';
        const html = inlineSync(test, {handlers: function (source, context) {
          if (source.tag == 'foo') source.content = 'foo';
        } });

        expect(html).to.eql('<foo>foo</foo>');
      });
      it('should inline sources with overridden js handler', function () {
        const test = '<script src="foo.js" inline></script>';
        const html = inlineSync(test, {handlers: function (source, context) {
          if (source.type == 'js') source.content = 'foo';
        } });

        expect(html).to.eql('<script>foo</script>');
      });
      it('should inline sources with custom handler and special props', function () {
        const test = '<script type="application/json" src="foo.json" inline inline-var="window.foo"></script>';
        const html = inlineSync(test, { handlers: function (source, context) {
          if (source.type == 'json') source.content = source.props.var + ' = ' + source.fileContent;
        } });

        expect(html).to.eql('<script type="application/json">window.foo = {' + eol + '  "foo": "foo"' + eol + '}</script>');
      });
    });
  });
});
