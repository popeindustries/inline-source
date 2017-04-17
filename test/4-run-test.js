'use strict';

const expect = require('expect.js');
const path = require('path');
const run = require('../lib/run');

let ctx;

describe('run', function() {
  beforeEach(function() {
    ctx = {
      attribute: 'inline',
      html: '',
      rootpath: path.resolve('./test'),
      sources: []
    };
  });

  it('should process a simple stack', function(done) {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function(source, context, next) {
          idx++;
          next();
        }
      ]
    });
    run(ctx, ctx.sources, false, function(err) {
      expect(err).to.be(null);
      expect(idx).to.equal(1);
      done();
    });
  });
  it('should synchronously process a simple stack', function() {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function(source, context, next) {
          idx++;
        }
      ]
    });
    run(ctx, ctx.sources, false);
    expect(idx).to.equal(1);
  });
  it('should process a complex stack', function(done) {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function(source, context, next) {
          idx++;
          next();
        },
        function(source, context, next) {
          idx++;
          next();
        }
      ]
    });
    run(ctx, ctx.sources, false, function(err) {
      expect(err).to.be(null);
      expect(idx).to.equal(2);
      done();
    });
  });
  it('should synchronously process a complex stack', function() {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function(source, context, next) {
          idx++;
        },
        function(source, context, next) {
          idx++;
        }
      ]
    });
    run(ctx, ctx.sources, false);
    expect(idx).to.equal(2);
  });
  it('should process multiple sources in parallel', function(done) {
    let idx = 0;

    ctx.sources.push(
      {
        parentContext: ctx,
        stack: [
          function(source, context, next) {
            idx++;
            next();
          },
          function(source, context, next) {
            idx++;
            next();
          }
        ]
      },
      {
        parentContext: ctx,
        stack: [
          function(source, context, next) {
            idx++;
            next();
          },
          function(source, context, next) {
            idx++;
            next();
          }
        ]
      }
    );
    run(ctx, ctx.sources, false, function(err) {
      expect(err).to.be(null);
      expect(idx).to.equal(4);
      done();
    });
  });
  it('should synchronously process multiple sources in parallel', function() {
    let idx = 0;

    ctx.sources.push(
      {
        parentContext: ctx,
        stack: [
          function(source, context, next) {
            idx++;
          },
          function(source, context, next) {
            idx++;
          }
        ]
      },
      {
        parentContext: ctx,
        stack: [
          function(source, context, next) {
            idx++;
          },
          function(source, context, next) {
            idx++;
          }
        ]
      }
    );
    run(ctx, ctx.sources, false);
    expect(idx).to.equal(4);
  });
  it('should handle errors', function(done) {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function(source, context, next) {
          idx++;
          next(new Error('oops'));
        },
        function(source, context, next) {
          idx++;
          next();
        }
      ]
    });
    run(ctx, ctx.sources, false, function(err) {
      expect(err).to.be.an(Error);
      expect(idx).to.equal(1);
      done();
    });
  });
  it('should handle errors for synchronous calls', function() {
    let idx = 0;

    ctx.sources.push({
      parentContext: ctx,
      stack: [
        function(source, context, next) {
          idx++;
          throw new Error('oops');
        },
        function(source, context, next) {
          idx++;
        }
      ]
    });
    try {
      run(ctx, ctx.sources, false);
    } catch (err) {
      expect(err).to.be.an(Error);
      expect(idx).to.equal(1);
    }
  });
  it('should handle multiple errors', function(done) {
    let idx = 0;

    ctx.sources.push(
      {
        parentContext: ctx,
        stack: [
          function(source, context, next) {
            idx++;
            next(new Error('oops'));
          },
          function(source, context, next) {
            idx++;
            next();
          }
        ]
      },
      {
        parentContext: ctx,
        stack: [
          function(source, context, next) {
            idx++;
            next(new Error('oops'));
          },
          function(source, context, next) {
            idx++;
            next();
          }
        ]
      }
    );
    run(ctx, ctx.sources, false, function(err) {
      expect(err).to.be.an(Error);
      expect(idx).to.equal(1);
      done();
    });
  });
});
