'use strict';

var path = require('path')
	, run = require('../lib/run')
	, should = require('should')

	, ctx;

describe('run', function () {
	beforeEach(function () {
		ctx = {
			attribute: 'inline',
			html: '',
			rootpath: path.resolve('./test'),
			sources: []
		};
	});

	it('should process a simple stack', function (done) {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
					next();
				}
			]
		});
		run(ctx, ctx.sources, false, function (err) {
			should.not.exist(err);
			idx.should.equal(1);
			done();
		});
	});
	it('should synchronously process a simple stack', function () {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
				}
			]
		});
		run(ctx, ctx.sources, false);
		idx.should.equal(1);
	});
	it('should process a complex stack', function (done) {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
					next();
				},
				function (source, context, next) {
					idx++;
					next();
				}
			]
		});
		run(ctx, ctx.sources, false, function (err) {
			should.not.exist(err);
			idx.should.equal(2);
			done();
		});
	});
	it('should synchronously process a complex stack', function () {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
				},
				function (source, context, next) {
					idx++;
				}
			]
		});
		run(ctx, ctx.sources, false);
		idx.should.equal(2);
	});
	it('should process multiple sources in parallel', function (done) {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
					next();
				},
				function (source, context, next) {
					idx++;
					next();
				}
			]
		},
		{
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
					next();
				},
				function (source, context, next) {
					idx++;
					next();
				}
			]
		});
		run(ctx, ctx.sources, false, function (err) {
			should.not.exist(err);
			idx.should.equal(4);
			done();
		});
	});
	it('should synchronously process multiple sources in parallel', function () {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
				},
				function (source, context, next) {
					idx++;
				}
			]
		},
		{
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
				},
				function (source, context, next) {
					idx++;
				}
			]
		});
		run(ctx, ctx.sources, false);
		idx.should.equal(4);
	});
	it('should handle errors', function (done) {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
					next(new Error('oops'));
				},
				function (source, context, next) {
					idx++; next();
				}
			]
		});
		run(ctx, ctx.sources, false, function (err) {
			should.exist(err);
			idx.should.equal(1);
			done();
		});
	});
	it('should handle errors for synchronous calls', function () {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
					throw new Error('oops');
				},
				function (source, context, next) {
					idx++;
				}
			]
		});
		try {
			run(ctx, ctx.sources, false);
		} catch (err) {
			should.exist(err);
			idx.should.equal(1);
		}
	});
	it('should handle multiple errors', function (done) {
		var idx = 0;
		ctx.sources.push({
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
					next(new Error('oops'));
				},
				function (source, context, next) {
					idx++;
					next();
				}
			]
		},
		{
			parentContext: ctx,
			stack: [
				function (source, context, next) {
					idx++;
					next(new Error('oops'));
				},
				function (source, context, next) {
					idx++;
					next();
				}
			]
		});
		run(ctx, ctx.sources, false, function (err) {
			should.exist(err);
			idx.should.equal(1);
			done();
		});
	});
});