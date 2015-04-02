var fs = require('fs')
	, path = require('path')
	, parse = require('../lib/parse')
	, should = require('should')
	, utils = require('../lib/utils')

	, ctx;

describe('parse', function () {
	beforeEach(function () {
		ctx = {
			attribute: 'inline',
			html: '',
			re: utils.getTagRegExp('inline'),
			rootpath: path.resolve('./test'),
			sources: []
		}
	});

	it('should ignore html with no matching inline tags', function (done) {
		ctx.html = '<p>foo</p>';
		parse(ctx, function (err) {
			should.not.exist(err);
			ctx.sources.should.have.length(0);
			done();
		});
	});
	it('should generate a source object for a matching inline <script> tag', function (done) {
		ctx.html = '<script inline></script>';
		parse(ctx, function (err) {
			should.not.exist(err);
			ctx.sources.should.have.length(1);
			ctx.sources[0].should.have.property('tag', 'script');
			ctx.sources[0].should.have.property('type', 'js');
			done();
		});
	});
	it('should generate a source object for a matching inline <link> tag', function (done) {
		ctx.html = '<link inline>';
		parse(ctx, function (err) {
			should.not.exist(err);
			ctx.sources.should.have.length(1);
			ctx.sources[0].should.have.property('tag', 'link');
			ctx.sources[0].should.have.property('type', 'css');
			done();
		});
	});
	it('should generate source objects for all tags with "inline" attribute', function (done) {
		ctx.html = fs.readFileSync(path.resolve('./test/fixtures/match.html'), 'utf-8');
		parse(ctx, function (err) {
			should.not.exist(err);
			ctx.sources.should.have.length(10);
			done();
		});
	});
	it('should parse an inline <script>\'s source path', function (done) {
		ctx.html = '<script src="foo.js" inline></script>';
		parse(ctx, function (err) {
			should.not.exist(err);
			ctx.sources.should.have.length(1);
			ctx.sources[0].should.have.property('filepath', path.resolve('./test/foo.js'));
			done();
		});
	});
	it('should parse an inline <script>\'s type', function (done) {
		ctx.html = '<script type="application/json" src="foo.json" inline></script>';
		parse(ctx, function (err) {
			should.not.exist(err);
			ctx.sources.should.have.length(1);
			ctx.sources[0].should.have.property('type', 'json');
			done();
		});
	});
});