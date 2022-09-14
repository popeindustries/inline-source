import { expect } from 'chai';
import { createContext } from '../src/context.js';

describe('context', () => {
  it('should return a default context', () => {
    const ctx = createContext();

    expect(ctx).to.have.property('attribute', 'inline');
    expect(ctx).to.have.property('compress', true);
    expect(ctx).to.have.property('pretty', false);
    expect(ctx).to.have.property('swallowErrors', false);
  });
  it('should allow overriding defaults with "options"', () => {
    const ctx = createContext({ compress: false });

    expect(ctx).to.have.property('compress', false);
  });
  it('should allow adding handlers', () => {
    const ctx = createContext({
      handlers: [
        function () {
          return Promise.resolve();
        },
      ],
    });

    expect(ctx.stack).to.have.length(7);
  });

  it('should allow adding preHandlers', () => {
    const ctx = createContext({
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
    const ctx = createContext({
      preHandlers: [handler],
    });

    expect(ctx.stack[0]).to.equal(handler);
  });
});
