'use strict';

const { expect } = require('chai');
const context = require('../lib/context');

describe('context', () => {
  it('should return a default context', () => {
    const ctx = context.create();

    expect(ctx).to.have.property('attribute', 'inline');
    expect(ctx).to.have.property('compress', true);
    expect(ctx).to.have.property('pretty', false);
    expect(ctx).to.have.property('swallowErrors', false);
  });
  it('should allow overriding defaults with "options"', () => {
    const ctx = context.create({ compress: false });

    expect(ctx).to.have.property('compress', false);
  });
  it('should allow adding handlers', () => {
    const ctx = context.create({
      handlers: [
        function () {
          return Promise.resolve();
        },
      ],
    });

    expect(ctx.stack).to.have.length(7);
  });

  it('should allow adding preHandlers', () => {
    const ctx = context.create({
      preHandlers: [
        function () {
          return Promise.resolve();
        },
      ],
    });

    expect(ctx.stack).to.have.length(7);
  });

  it('preHandlers should be added first', () => {
    function handler() {
      return Promise.resolve();
    }
    const ctx = context.create({
      preHandlers: [handler],
    });

    expect(ctx.stack[0]).to.equal(handler);
  });
});
