var inline = require('..')
	, path = require('path')
	, fs = require('fs')
	, should = require('should');

describe('inline-source', function() {
	before(function() {
		process.chdir('./test/fixtures');
	});
	describe('script tag inlining', function() {
		it('should ignore commented sources', function(done) {
			var test = '<!-- <script inline src="foo.js"></script> -->';
			inline(test, function(err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute', function(done) {
			var test = '<script src="foo.js"></script>';
			inline(test, function(err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function(done) {
			var test = '<script src="inline.js"></script>';
			inline(test, function(err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute', function(done) {
			var test = '<script inline src="foo.js"></script>';
			inline(test, function(err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function(done) {
			var test = '		<script inline src="foo.js"></script>';
			inline(test, function(err, html) {
				html.should.eql('		<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <script> tag', function(done) {
			var test = '<script src="foo.js" inline></script>';
			inline(test, function(err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <script> tag surrounded by whitespace', function(done) {
			var test = '<script src="foo.js" inline ></script>';
			inline(test, function(err, html) {
				html.should.eql('<script>var foo=this;</script>');
				done();
			});
		});
		it('should remove the "inline" attribute for sources that can\'t be found', function(done) {
			var test = '<script inline src="bar.js"></script>';
			inline(test, function(err, html) {
				html.should.eql('<script src="bar.js"></script>');
				done();
			});
		});
	});

	describe('link tag inlining', function() {
		it('should ignore commented sources', function(done) {
			var test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
			inline(test, function(err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute', function(done) {
			var test = '<link rel="stylesheet" href="foo.js">';
			inline(test, function(err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function(done) {
			var test = '<link rel="stylesheet" href="inline.js">';
			inline(test, function(err, html) {
				html.should.eql(test);
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute', function(done) {
			var test = '<link inline rel="stylesheet" href="foo.css">';
			inline(test, function(err, html) {
				html.should.eql('<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function(done) {
			var test = '		<link inline rel="stylesheet" href="foo.css">';
			inline(test, function(err, html) {
				html.should.eql('		<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <link> tag', function(done) {
			var test = '<link rel="stylesheet" href="foo.css" inline>';
			inline(test, function(err, html) {
				html.should.eql('<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should inline sources that contain an "inline" attribute at the end of the <link> tag surrounded by whitespace', function(done) {
			var test = '<link rel="stylesheet" href="foo.css" inline >';
			inline(test, function(err, html) {
				html.should.eql('<style>body{background-color:#fff}</style>');
				done();
			});
		});
		it('should remove the "inline" attribute for sources that can\'t be found', function(done) {
			var test = '<link inline rel="stylesheet" href="bar.css">';
			inline(test, function(err, html) {
				html.should.eql('<link rel="stylesheet" href="bar.css">');
				done();
			});
		});
	});
});