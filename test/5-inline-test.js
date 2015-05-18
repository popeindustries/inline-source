'use strict';

var inline = require('..')
	, inlineSync = require('..').sync
	, path = require('path')
	, should = require('should');

describe('inline', function () {
	before(function () {
		process.chdir('./test/fixtures');
	});

	describe('<script>', function () {
		describe('async', function () {
			it('should ignore commented sources', function (done) {
				var test = '<!-- <script inline src="foo.js"></script> -->';
				inline(test, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should ignore sources that don\'t contain an "inline" attribute', function (done) {
				var test = '<script src="foo.js"></script>';
				inline(test, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function (done) {
				var test = '<script src="inline.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute', function (done) {
				var test = '<script inline src="foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline multiple sources that contain an "inline" attribute', function (done) {
				var test = '<script inline src="foo.js"></script>\n<script inline src="bar.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>\n<script>var bar=this;console.log(bar);</script>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function (done) {
				var test = '		<script inline src="foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('		<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <script> tag', function (done) {
				var test = '<script src="foo.js" inline></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <script> tag surrounded by whitespace', function (done) {
				var test = '<script src="foo.js" inline ></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function (done) {
				var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
				inline(test, { compress: true, swallowErrors: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script src="baz.js"></script>\n<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should return an error when options.swallowErrors is "false"', function (done) {
				var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.exist(err);
					done();
				});
			});
			it('should preserve order of multiple inlined items', function (done) {
				var test = '<script inline src="bar.js"></script>\n<script inline src="foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var bar=this;console.log(bar);</script>\n<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should allow specification of a custom attribute name', function (done) {
				var test = '<script data-inline src="bar.js"></script>';
				inline(test, { compress: true, attribute: 'data-inline' }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var bar=this;console.log(bar);</script>');
					done();
				});
			});
			it('should load html source content if none specified', function (done) {
				inline(path.resolve('test.html'), function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources referenced by relative path', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources referenced by absolute path relative to project directory', function (done) {
				var test = '<script inline src="/nested/foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources referenced by absolute path relative to passed rootpath directory', function (done) {
				var test = '<script inline src="/bar.js"></script>';
				inline(test, { compress: true, rootpath: path.resolve('nested/deep') }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var bar=this;console.log(bar);</script>');
					done();
				});
			});
			it('should not compress inlined content when options.compressed is "false"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo = this;\nconsole.log(foo);</script>');
					done();
				});
			});
			it('should replace content ignoring special string.replace tokens', function (done) {
				var test = '<script inline src="./nested/tokens.js"></script>';
				inline(test, { compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>e&$&&(doSomething());</script>');
					done();
				});
			});
			it('should not inline content when options.ignore includes "script"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true, ignore: ['script'] }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script inline src="./nested/foo.js"></script>');
					done();
				});
			});
			it('should not inline content when options.ignore includes "js"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true, ignore: ['js'] }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script inline src="./nested/foo.js"></script>');
					done();
				});
			});
			it('should not inline content when v3.x style options.ignore.type includes "js"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true, ignore: { type: ['js'] } }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script inline src="./nested/foo.js"></script>');
					done();
				});
			});
			it('should not inline content when v3.x style options.ignore.tag includes "script"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true, ignore: { tag: 'script' } }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script inline src="./nested/foo.js"></script>');
					done();
				});
			});
			it('should preserve whitespace while inlining content when options.pretty is "true"', function (done) {
				inline(path.resolve('multiline.html'), { pretty: true, compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>\n  var foo = \'foo\'\n    , bar = \'bar\';\n\n  function baz () {\n    console.log(foo, bar);\n  }\n\n  baz();\n  </script>\n</head>\n<body>\n\n</body>\n</html>');
					done();
				});
			});
			it('should parse html templates for inlineable content', function (done) {
				inline(path.resolve('head.nunjs'), function (err, html) {
					should.not.exist(err);
					html.should.eql('<head>\n  <meta charset="utf-8">\n  <title>{{ title }}</title>\n  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />\n\n  {% if js %}\n    <script>var foo=this;console.log(foo);</script>\n  {% endif %}\n\n  <link rel="stylesheet" href={{ assets[\'index.css\'] }}>\n\n</head>');
					done();
				});
			});
			it('should escape closing <script> tags in content', function (done) {
				var test = '<script src="scriptTag.js" inline></script>';
				inline(test, { compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql("<script>(a='<script>document.domain=\"'+document.domain+'\";\x3c/script>');</script>");
					done();
				});
			});
		});

		describe('sync', function () {
			it('should ignore commented sources', function () {
				var test = '<!-- <script inline src="foo.js"></script> -->';
				var html = inlineSync(test);
				html.should.eql(test);
			});
			it('should inline sources that contain an "inline" attribute', function () {
				var test = '<script inline src="foo.js"></script>';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<script>var foo=this;console.log(foo);</script>');
			});
			it('should inline multiple sources that contain an "inline" attribute', function () {
				var test = '<script inline src="foo.js"></script>\n<script inline src="bar.js"></script>';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<script>var foo=this;console.log(foo);</script>\n<script>var bar=this;console.log(bar);</script>');
			});
			it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function () {
				var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
				var html = inlineSync(test, { compress: true, swallowErrors: true });
				html.should.eql('<script src="baz.js"></script>\n<script>var foo=this;console.log(foo);</script>');
			});
			it('should return an error when options.swallowErrors is "false"', function () {
				var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
				try {
					var html = inlineSync(test, { compress: true });
					should.not.exist(html);
				} catch (err) {
					should.exist(err);
				}
			});
			it('should preserve order of multiple inlined items', function () {
				var test = '<script inline src="bar.js"></script>\n<script inline src="foo.js"></script>';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<script>var bar=this;console.log(bar);</script>\n<script>var foo=this;console.log(foo);</script>');
			});
			it('should load html source content if none specified', function () {
				var html = inlineSync(path.resolve('test.html'));
				html.should.eql('<script>var foo=this;console.log(foo);</script>');
			});
			it('should parse html templates for inlineable content', function () {
				var html = inlineSync(path.resolve('head.nunjs'));
				html.should.eql('<head>\n  <meta charset="utf-8">\n  <title>{{ title }}</title>\n  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />\n\n  {% if js %}\n    <script>var foo=this;console.log(foo);</script>\n  {% endif %}\n\n  <link rel="stylesheet" href={{ assets[\'index.css\'] }}>\n\n</head>');
			});
		});
	});

	describe('<link>', function () {
		describe('async', function () {
			it('should ignore commented sources', function (done) {
				var test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should ignore sources that don\'t contain an "inline" attribute', function (done) {
				var test = '<link rel="stylesheet" href="foo.js">';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function (done) {
				var test = '<link rel="stylesheet" href="inline.js">';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute', function (done) {
				var test = '<link inline rel="stylesheet" href="foo.css">';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<style>body{background-color:#fff}</style>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function (done) {
				var test = '		<link inline rel="stylesheet" href="foo.css">';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('		<style>body{background-color:#fff}</style>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <link> tag', function (done) {
				var test = '<link rel="stylesheet" href="foo.css" inline>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<style>body{background-color:#fff}</style>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <link> tag surrounded by whitespace', function (done) {
				var test = '<link rel="stylesheet" href="foo.css" inline >';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<style>body{background-color:#fff}</style>');
					done();
				});
			});
			it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function (done) {
				var test = '<link inline rel="stylesheet" href="bar.css">';
				inline(test, { compress: true, swallowErrors: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<link rel="stylesheet" href="bar.css">');
					done();
				});
			});
			it('should not inline content when options.ignore includes "link"', function (done) {
				var test = '<link inline rel="stylesheet" href="foo.css">';
				inline(test, { compress: true, ignore: 'link' }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<link inline rel="stylesheet" href="foo.css">');
					done();
				});
			});
			it('should not inline content when options.ignore includes "css"', function (done) {
				var test = '<link inline rel="stylesheet" href="foo.css">';
				inline(test, { compress: true, ignore: 'css' }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<link inline rel="stylesheet" href="foo.css">');
					done();
				});
			});
		});

		describe('sync', function () {
			it('should ignore commented sources', function () {
				var test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
				var html = inlineSync(test, { compress: true });
				html.should.eql(test);
			});
			it('should inline sources that contain an "inline" attribute', function () {
				var test = '<link inline rel="stylesheet" href="foo.css">';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<style>body{background-color:#fff}</style>');
			});
			it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function () {
				var test = '<link inline rel="stylesheet" href="bar.css">';
				var html = inlineSync(test, { compress: true, swallowErrors: true });
				html.should.eql('<link rel="stylesheet" href="bar.css">');
			});
		});
	});

	describe('<custom>', function () {
		describe('async', function () {
			it('should ignore tag types with no handler', function (done) {
				var test = '<foo inline></foo>';
				inline(test, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should inline sources for custom tags and custom handler', function (done) {
				var test = '<foo inline></foo>';
				inline(test, {handlers: function (source, context, next) {
					if (source.tag == 'foo') source.content = 'foo';
					next();
				}}, function (err, html) {
					should.not.exist(err);
					html.should.eql('<foo>foo</foo>');
					done();
				});
			});
			it('should inline sources with overridden js handler', function (done) {
				var test = '<script src="foo.js" inline></script>';
				inline(test, {handlers: function (source, context, next) {
					if (source.type == 'js') source.content = 'foo';
					next();
				}}, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>foo</script>');
					done();
				});
			});
			it('should inline sources with custom handler and special props', function (done) {
				var test = '<script type="application/json" src="foo.json" inline inline-var="window.foo"></script>';
				inline(test, { handlers: function (source, context, next) {
					if (source.type == 'json') source.content = source.props.var + ' = ' + source.fileContent;
					next();
				} }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script type="application/json">window.foo = {\n  "foo": "foo"\n}</script>');
					done();
				});
			});
		});

		describe('sync', function () {
			it('should ignore tag types with no handler', function () {
				var test = '<foo inline></foo>';
				var html = inlineSync(test);
				html.should.eql(test);
			});
			it('should inline sources for custom tags and custom handler', function () {
				var test = '<foo inline></foo>';
				var html = inlineSync(test, {handlers: function (source, context) {
					if (source.tag == 'foo') source.content = 'foo';
				} });
				html.should.eql('<foo>foo</foo>');
			});
			it('should inline sources with overridden js handler', function () {
				var test = '<script src="foo.js" inline></script>';
				var html = inlineSync(test, {handlers: function (source, context) {
					if (source.type == 'js') source.content = 'foo';
				} });
				html.should.eql('<script>foo</script>');
			});
			it('should inline sources with custom handler and special props', function () {
				var test = '<script type="application/json" src="foo.json" inline inline-var="window.foo"></script>';
				var html = inlineSync(test, { handlers: function (source, context) {
					if (source.type == 'json') source.content = source.props.var + ' = ' + source.fileContent;
				} });
				html.should.eql('<script type="application/json">window.foo = {\n  "foo": "foo"\n}</script>');
			});
		});
	});
});