'use strict';

const { expect } = require('chai');
const path = require('path');
const run = require('../lib/run');

let ctx;

describe('run', () => {
  beforeEach(() => {
    ctx = {
      attribute: 'inline',
      html: '',
      rootpath: path.resolve('./test'),
      sources: [],
    };
  });

  it('should process a simple stack', async () => {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function () {
          idx++;
          return Promise.resolve();
        },
      ],
    });
    await run(ctx, ctx.sources, false);
    expect(idx).to.equal(1);
  });
  it('should process a complex stack', async () => {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function () {
          return new Promise((resolve) => {
            setTimeout(() => {
              idx++;
              resolve();
            }, 50);
          });
        },
        function () {
          idx++;
          return Promise.resolve();
        },
      ],
    });
    await run(ctx, ctx.sources, false);
    expect(idx).to.equal(2);
  });
  it('should process multiple sources in parallel', async () => {
    const stack = [];
    let idx = 0;

    ctx.sources.push(
      {
        parentContext: ctx,
        stack: [
          function () {
            return new Promise((resolve) => {
              setTimeout(() => {
                idx++;
                stack.push('1a');
                resolve();
              }, 50);
            });
          },
          function () {
            idx++;
            stack.push('1b');
            return Promise.resolve();
          },
        ],
      },
      {
        parentContext: ctx,
        stack: [
          function () {
            idx++;
            stack.push('2a');
            return Promise.resolve();
          },
          function () {
            idx++;
            stack.push('2b');
            return Promise.resolve();
          },
        ],
      }
    );
    await run(ctx, ctx.sources, false);
    expect(idx).to.equal(4);
    expect(stack).to.eql(['2a', '2b', '1a', '1b']);
  });
  it('should handle errors', async () => {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function () {
          idx++;
          return Promise.reject(new Error('oops'));
        },
        function () {
          idx++;
          return Promise.resolve();
        },
      ],
    });
    try {
      await run(ctx, ctx.sources, false);
    } catch (err) {
      expect(err).to.be.an('error');
    }
    expect(idx).to.equal(1);
  });
  it('should handle swallowed errors', async () => {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function () {
          idx++;
          return Promise.reject(new Error('oops'));
        },
        function () {
          idx++;
          return Promise.resolve();
        },
      ],
    });
    await run(ctx, ctx.sources, true);
    expect(idx).to.equal(2);
  });
  it('should handle multiple errors', async () => {
    let idx = 0;

    ctx.sources.push(
      {
        parentContext: ctx,
        stack: [
          function () {
            idx++;
            return Promise.reject(new Error('oops'));
          },
          function () {
            idx++;
            return Promise.resolve();
          },
        ],
      },
      {
        parentContext: ctx,
        stack: [
          function () {
            idx++;
            return Promise.reject(new Error('oops'));
          },
          function () {
            idx++;
            return Promise.resolve();
          },
        ],
      }
    );
    try {
      await run(ctx, ctx.sources, false);
    } catch (err) {
      expect(err).to.be.an('error');
    }
    expect(idx).to.equal(2);
  });
  it('should handle multiple swallowed errors', async () => {
    let idx = 0;

    ctx.sources.push(
      {
        parentContext: ctx,
        stack: [
          function () {
            idx++;
            return Promise.reject(new Error('oops'));
          },
          function () {
            idx++;
            return Promise.resolve();
          },
        ],
      },
      {
        parentContext: ctx,
        stack: [
          function () {
            idx++;
            return Promise.reject(new Error('oops'));
          },
          function () {
            idx++;
            return Promise.resolve();
          },
        ],
      }
    );
    await run(ctx, ctx.sources, true);
    expect(idx).to.equal(4);
  });
});
