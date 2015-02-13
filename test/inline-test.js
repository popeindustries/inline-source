var inline = require('..')
	, path = require('path')
	, fs = require('fs')
	, should = require('should');

describe('inline-source', function () {
	before(function () {
		process.chdir('./test/fixtures');
	});
	describe('<script> tag inlining', function () {
		it('should ignore commented sources', function () {
			var test = '<!-- <script inline src="foo.js"></script> -->';
			html = inline(process.cwd(), test);
			html.should.eql(test);
		});
		it('should ignore sources that don\'t contain an "inline" attribute', function () {
			var test = '<script src="foo.js"></script>'
			html = inline(process.cwd(), test);
			html.should.eql(test);
		});
		it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function () {
			var test = '<script src="inline.js"></script>';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql(test);
		});
		it('should inline sources that contain an "inline" attribute', function () {
			var test = '<script inline src="foo.js"></script>';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<script>var foo=this;</script>');
		});
		it('should inline multiple sources that contain an "inline" attribute', function () {
			var test = '<script inline src="foo.js"></script>\n<script inline src="bar.js"></script>';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<script>var foo=this;</script>\n<script>var bar=this;</script>');
		});
		it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function () {
			var test = '		<script inline src="foo.js"></script>';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('		<script>var foo=this;</script>');
		});
		it('should inline sources that contain an "inline" attribute at the end of the <script> tag', function () {
			var test = '<script src="foo.js" inline></script>';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<script>var foo=this;</script>');
		});
		it('should inline sources that contain an "inline" attribute at the end of the <script> tag surrounded by whitespace', function () {
			var test = '<script src="foo.js" inline ></script>';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<script>var foo=this;</script>');
		});
		it('should remove the "inline" attribute for sources that can\'t be found', function () {
			var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<script src="baz.js"></script>\n<script>var foo=this;</script>');
		});
		it('should allow specification of a custom attribute name', function () {
			var test = '<script data-inline src="baz.js"></script>\n<script data-inline src="foo.js"></script>';
			html = inline(process.cwd(), test, {compress: true, attribute: 'data-inline'});
			html.should.eql('<script src="baz.js"></script>\n<script>var foo=this;</script>');
		});
		it('should throw an error when options.swallowErrors is "false"', function () {
			var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
			try {
				inline(process.cwd(), test, {swallowErrors: false});
			} catch (err) {
				should.exist(err);
			}
		});
		it('should load html source content if none specified', function () {
			html = inline(path.resolve('test.html'));
			html.should.eql('<script>var foo=this;</script>');
		});
		it('should inline sources referenced by relative path', function () {
			var test = '<script inline src="./nested/foo.js"></script>';
			html = inline(path.resolve('index.html'), test, {compress: true});
			html.should.eql('<script>var foo=this;</script>');
		});
		it('should inline sources referenced by absolute path relative to project directory', function () {
			var test = '<script inline src="/nested/foo.js"></script>';
			html = inline(path.resolve('nested/index.html'), test, {compress: true});
			html.should.eql('<script>var foo=this;</script>');
		});
		it('should inline sources referenced by absolute path relative to passed rootpath directory', function () {
			var test = '<script inline src="/bar.js"></script>';
			html = inline(path.resolve('nested/index.html'), test, {compress: true, rootpath: path.resolve('nested/deep')});
			html.should.eql('<script>var bar=this;</script>');
		});
		it('should not compress inlined content when options.compressed is "false"', function () {
			var test = '<script inline src="./nested/foo.js"></script>';
			html = inline(path.resolve('index.html'), test, {compress: false});
			html.should.eql('<script>var foo = this;</script>');
		});
		it('should not unescape escaped script tags in inlined content', function () {
			var test = '<script inline src="scriptTag.js"></script>';
			html = inline(path.resolve('index.html'), test, {compress: false});
			html.should.eql("<script>(a='<script>document.domain=\"'+document.domain+'\";\\x3c/script>');</script>");
		});
		it('should inline content when options.inlineJS is "true"', function () {
			var test = '<script inline src="./nested/foo.js"></script>';
			html = inline(path.resolve('index.html'), test, {inlineJS: true});
			html.should.eql('<script>var foo=this;</script>');
		});
		it('should not inline content when options.inlineJS is "false"', function () {
			var test = '<script inline src="./nested/foo.js"></script>';
			html = inline(path.resolve('index.html'), test, {inlineJS: false});
			html.should.eql('<script inline src="./nested/foo.js"></script>');
		});
		it('should preserve whitespace while inlining content when options.pretty is "true"', function () {
			html = inline(path.resolve('multiline.html'), {pretty: true, compress: false});
			html.should.eql('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>\n  var foo = \'foo\'\n    , bar = \'bar\';\n\n  function baz () {\n    console.log(\'baz\');\n  }\n  </script>\n</head>\n<body>\n\n</body>\n</html>');
		});
	});

	describe('<link> tag inlining', function () {
		it('should ignore commented sources', function () {
			var test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql(test);
		});
		it('should ignore sources that don\'t contain an "inline" attribute', function () {
			var test = '<link rel="stylesheet" href="foo.js">';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql(test);
		});
		it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function () {
			var test = '<link rel="stylesheet" href="inline.js">';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql(test);
		});
		it('should inline sources that contain an "inline" attribute', function () {
			var test = '<link inline rel="stylesheet" href="foo.css">';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<style>body{background-color:#fff}</style>');
		});
		it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function () {
			var test = '		<link inline rel="stylesheet" href="foo.css">';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('		<style>body{background-color:#fff}</style>');
		});
		it('should inline sources that contain an "inline" attribute at the end of the <link> tag', function () {
			var test = '<link rel="stylesheet" href="foo.css" inline>';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<style>body{background-color:#fff}</style>');
		});
		it('should inline sources that contain an "inline" attribute at the end of the <link> tag surrounded by whitespace', function () {
			var test = '<link rel="stylesheet" href="foo.css" inline >';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<style>body{background-color:#fff}</style>');
		});
		it('should remove the "inline" attribute for sources that can\'t be found', function () {
			var test = '<link inline rel="stylesheet" href="bar.css">';
			html = inline(process.cwd(), test, {compress: true});
			html.should.eql('<link rel="stylesheet" href="bar.css">');
		});
		it('should inline content when options.inlineCSS is "true"', function () {
			var test = '<link inline rel="stylesheet" href="foo.css">';
			html = inline(path.resolve('index.html'), test, {inlineCSS: true});
			html.should.eql('<style>body{background-color:#fff}</style>');
		});
		it('should not inline content when options.inlineCSS is "false"', function () {
			var test = '<link inline rel="stylesheet" href="foo.css">';
			html = inline(path.resolve('index.html'), test, {inlineCSS: false});
			html.should.eql('<link inline rel="stylesheet" href="foo.css">');
		});
	});
});