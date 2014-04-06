var inline = require('..')
	, path = require('path')
	, fs = require('fs')
	, should = require('should');

describe('inline-source', function() {
	before(function() {
		process.chdir('./test/fixtures');
	});
	describe('<script> tag inlining', function() {
		it('should ignore commented sources', function(done) {
			var test = '<!-- <script inline src="foo.js"></script> -->';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute', function(done) {
			var test = '<script src="foo.js"></script>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function(done) {
			var test = '<script src="inline.js"></script>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute', function(done) {
			var test = '<script inline src="foo.js"></script>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline multiple sources that contain an "inline" attribute', function(done) {
			var test = '<script inline src="foo.js"></script>\n<script inline src="bar.js"></script>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<script>var foo=this;</script>\n<script>var bar=this;</script>');
				done();
			});
		});
		it('should expose a Promise interface in addition to callback', function(done) {
			var test = '<script inline src="foo.js"></script>';
			inline(process.cwd(), test).then(function (html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function(done) {
			var test = '		<script inline src="foo.js"></script>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('		<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <script> tag', function(done) {
			var test = '<script src="foo.js" inline></script>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <script> tag surrounded by whitespace', function(done) {
			var test = '<script src="foo.js" inline ></script>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should remove the "inline" attribute for sources that can\'t be found', function(done) {
			var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<script src="baz.js"></script>\n<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources referenced by relative path', function(done) {
			var test = '<script inline src="./nested/foo.js"></script>';
			inline(path.resolve('index.html'), test, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources referenced by absolute path', function(done) {
			var test = '<script inline src="/nested/foo.js"></script>';
			inline(path.resolve('nested/index.html'), test, function (err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
	});

	describe('<link> tag inlining', function() {
		it('should ignore commented sources', function(done) {
			var test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute', function(done) {
			var test = '<link rel="stylesheet" href="foo.js">';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function(done) {
			var test = '<link rel="stylesheet" href="inline.js">';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute', function(done) {
			var test = '<link inline rel="stylesheet" href="foo.css">';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function(done) {
			var test = '		<link inline rel="stylesheet" href="foo.css">';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('		<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <link> tag', function(done) {
			var test = '<link rel="stylesheet" href="foo.css" inline>';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <link> tag surrounded by whitespace', function(done) {
			var test = '<link rel="stylesheet" href="foo.css" inline >';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should remove the "inline" attribute for sources that can\'t be found', function(done) {
			var test = '<link inline rel="stylesheet" href="bar.css">';
			inline(process.cwd(), test, function (err, html) {
				html.should.eql('<link rel="stylesheet" href="bar.css">');
				done();
			});
		});
	});

	describe('sync() inlining', function () {
		it('should synchronously ignore sources that don\'t contain an "inline" attribute', function() {
			var test = '<script src="foo.js"></script>';
			var html = inline.sync(process.cwd(), test);
			html.should.eql(test);
		});
		it('should synchronously inline sources that contain an "inline" attribute', function() {
			var test = '<script inline src="foo.js"></script>';
			var html = inline.sync(process.cwd(), test);
			html.should.eql('<script>var foo=this;</script>');
		});
	});
});