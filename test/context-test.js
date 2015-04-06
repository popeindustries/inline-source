var context = require('../lib/context');

describe('context', function () {
	it('should return a default context', function () {
		var ctx = context.create()
		ctx.should.have.property('attribute', 'inline');
		ctx.should.have.property('compress', true);
		ctx.should.have.property('pretty', false);
		ctx.should.have.property('swallowErrors', true);
	});
	it('should allow overriding defaults with "options"', function () {
		var ctx = context.create({ compress: false })
		ctx.should.have.property('compress', false);
	});
	it('should allow adding handlers', function () {
		var ctx = context.create({ handlers: [function (source, next) { next(); } ] })
		ctx.stack.should.have.length(5);
	});
});