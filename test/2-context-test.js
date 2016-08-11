'use strict';

const expect = require('expect.js');
const context = require('../lib/context');

describe('context', function () {
  it('should return a default context', function () {
    const ctx = context.create();

    expect(ctx).to.have.property('attribute', 'inline');
    expect(ctx).to.have.property('compress', true);
    expect(ctx).to.have.property('pretty', false);
    expect(ctx).to.have.property('swallowErrors', false);
  });
  it('should allow overriding defaults with "options"', function () {
    const ctx = context.create({ compress: false });

    expect(ctx).to.have.property('compress', false);
  });
  it('should allow adding handlers', function () {
    const ctx = context.create({
      handlers: [
        function (source, next) {
          next();
        }
      ]
    });

    expect(ctx.stack).to.have.length(7);
  });
});