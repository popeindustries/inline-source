var inline = require('..')
	, path = require('path')
	, fs = require('fs')
	, should = require('should');

describe('inline', function () {
	before(function () {
		process.chdir('./test/fixtures');
	});

	describe('<script> tag inlining', function () {
		it('should ignore commented sources', function (done) {
			var test = '<!-- <script inline src="foo.js"></script> -->';
			inline(test, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute', function (done) {
			var test = '<script src="foo.js"></script>'
			inline(test, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function (done) {
			var test = '<script src="inline.js"></script>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute', function (done) {
			var test = '<script inline src="foo.js"></script>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline multiple sources that contain an "inline" attribute', function (done) {
			var test = '<script inline src="foo.js"></script>\n<script inline src="bar.js"></script>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('<script>var foo=this;</script>\n<script>var bar=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function (done) {
			var test = '		<script inline src="foo.js"></script>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('		<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <script> tag', function (done) {
			var test = '<script src="foo.js" inline></script>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <script> tag surrounded by whitespace', function (done) {
			var test = '<script src="foo.js" inline ></script>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function (done) {
			var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
			inline(test, { compress: true, swallowErrors: true }, function (err, html) {
				should.not.exist(err);
				html.should.eql('<script src="baz.js"></script>\n<script>var foo=this;</script>');
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
		it('should allow specification of a custom attribute name', function (done) {
			var test = '<script data-inline src="bar.js"></script>\n<script data-inline src="foo.js"></script>';
			inline(test, { compress: true, attribute: 'data-inline' }, function (err, html) {
				html.should.eql('<script>var bar=this;</script>\n<script>var foo=this;</script>');
				done();
			});
		});
		it('should load html source content if none specified', function (done) {
			inline(path.resolve('test.html'), function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources referenced by relative path', function (done) {
			var test = '<script inline src="./nested/foo.js"></script>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources referenced by absolute path relative to project directory', function (done) {
			var test = '<script inline src="/nested/foo.js"></script>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources referenced by absolute path relative to passed rootpath directory', function (done) {
			var test = '<script inline src="/bar.js"></script>';
			inline(test, { compress: true, rootpath: path.resolve('nested/deep') }, function (err, html) {
				html.should.eql('<script>var bar=this;</script>');
				done();
			});
		});
		it('should not compress inlined content when options.compressed is "false"', function (done) {
			var test = '<script inline src="./nested/foo.js"></script>';
			inline(test, { compress: false }, function (err, html) {
				html.should.eql('<script>var foo = this;</script>');
				done();
			});
		});
		it('should replace content ignoring special string.replace tokens', function (done) {
			var test = '<script inline src="./nested/tokens.js"></script>';
			inline(test, { compress: false }, function (err, html) {
				html.should.eql('<script>e&$&&(doSomething());</script>');
				done();
			});
		});
		it.skip('should inline content when options.inlineJS is "true"', function (done) {
			var test = '<script inline src="./nested/foo.js"></script>';
			html = inline(path.resolve('index.html'), test, {inlineJS: true});
			html.should.eql('<script>var foo=this;</script>');
		});
		it.skip('should not inline content when options.inlineJS is "false"', function (done) {
			var test = '<script inline src="./nested/foo.js"></script>';
			html = inline(path.resolve('index.html'), test, {inlineJS: false});
			html.should.eql('<script inline src="./nested/foo.js"></script>');
		});
		it('should preserve whitespace while inlining content when options.pretty is "true"', function (done) {
			inline(path.resolve('multiline.html'), { pretty: true, compress: false }, function (err, html) {
				html.should.eql('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>\n  var foo = \'foo\'\n    , bar = \'bar\';\n\n  function baz () {\n    console.log(\'baz\');\n  }\n  </script>\n</head>\n<body>\n\n</body>\n</html>');
				done();
			});
		});
	});

	describe('<link> tag inlining', function () {
		it('should ignore commented sources', function (done) {
			var test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute', function (done) {
			var test = '<link rel="stylesheet" href="foo.js">';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function (done) {
			var test = '<link rel="stylesheet" href="inline.js">';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute', function (done) {
			var test = '<link inline rel="stylesheet" href="foo.css">';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function (done) {
			var test = '		<link inline rel="stylesheet" href="foo.css">';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('		<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <link> tag', function (done) {
			var test = '<link rel="stylesheet" href="foo.css" inline>';
			inline(test, { compress: true }, function (err, html) {
				html.should.eql('<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <link> tag surrounded by whitespace', function (done) {
			var test = '<link rel="stylesheet" href="foo.css" inline >';
			inline(test, { compress: true }, function (err, html) {
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
		it.skip('should inline content when options.inlineCSS is "true"', function (done) {
			var test = '<link inline rel="stylesheet" href="foo.css">';
			html = inline(path.resolve('index.html'), test, {inlineCSS: true});
			html.should.eql('<style>body{background-color:#fff}</style>');
		});
		it.skip('should not inline content when options.inlineCSS is "false"', function (done) {
			var test = '<link inline rel="stylesheet" href="foo.css">';
			html = inline(path.resolve('index.html'), test, {inlineCSS: false});
			html.should.eql('<link inline rel="stylesheet" href="foo.css">');
		});
	});
});