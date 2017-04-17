'use strict';

const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const parse = require('../lib/parse');
const utils = require('../lib/utils');

let ctx;

function createContext(attribute) {
  return {
    attribute: attribute,
    html: '',
    ignore: { tag: [], type: [] },
    re: utils.getTagRegExp(attribute),
    rootpath: path.resolve('./test'),
    sources: []
  };
}

describe('parse', function() {
  beforeEach(function() {
    ctx = createContext('inline');
  });

  it('should ignore html with no matching inline tags', function(done) {
    ctx.html = '<p>foo</p>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(0);
      done();
    });
  });
  it('should ignore html with inlined style tag and "inline-block"', function(done) {
    ctx.html = '<span style="display: inline-block;" ng-if="x>0"></span>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(0);
      done();
    });
  });
  it('should generate a source object for a matching inline <script> tag', function(done) {
    ctx.html = '<script inline></script>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('tag', 'script');
      expect(ctx.sources[0]).to.have.property('type', 'js');
      done();
    });
  });
  it('should generate a source object for a matching inline <script> tag when attribute=false', function(done) {
    ctx = createContext(false);
    ctx.html = '<script></script>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('tag', 'script');
      expect(ctx.sources[0]).to.have.property('type', 'js');
      done();
    });
  });
  it('should generate a source object for a matching inline <link> tag', function(done) {
    ctx.html = '<link inline>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('tag', 'link');
      expect(ctx.sources[0]).to.have.property('type', 'css');
      done();
    });
  });
  it('should generate a source object for a matching inline <link> tag when attribute=false', function(done) {
    ctx = createContext(false);
    ctx.html = '<link inline>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('tag', 'link');
      expect(ctx.sources[0]).to.have.property('type', 'css');
      done();
    });
  });
  it('should generate source objects for all tags with "inline" attribute', function(done) {
    ctx.html = fs.readFileSync(path.resolve('./test/fixtures/match.html'), 'utf-8');
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(14);
      done();
    });
  });
  it('should generate source objects for all tags when attribute=false', function(done) {
    ctx = createContext(false);
    ctx.html = fs.readFileSync(path.resolve('./test/fixtures/match-any.html'), 'utf-8');
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(14);
      done();
    });
  });
  it('should synchronously generate source objects for all tags with "inline" attribute', function() {
    ctx.html = fs.readFileSync(path.resolve('./test/fixtures/match.html'), 'utf-8');
    parse(ctx);
    expect(ctx.sources).to.have.length(14);
  });
  it('should generate a source object for a matching inline <link> tag inside an ie conditional comment', function(
    done
  ) {
    ctx.html = '<!--[if IE 8 ]>\n  <link inline rel="stylesheet" href="css/ie.min.css" >\n<![endif]-->';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('tag', 'link');
      expect(ctx.sources[0]).to.have.property('type', 'css');
      done();
    });
  });
  it('should generate a source object for a matching inline <link> tag with "inline=true"', function(done) {
    ctx.html = '<link inline="true">';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('tag', 'link');
      expect(ctx.sources[0]).to.have.property('type', 'css');
      done();
    });
  });
  it('should generate a source object for a matching inline <link> tag with "inline=inline"', function(done) {
    ctx.html = '<link inline="inline">';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('tag', 'link');
      expect(ctx.sources[0]).to.have.property('type', 'css');
      done();
    });
  });
  it("should parse an inline <script>'s source path", function(done) {
    ctx.html = '<script src="foo.js" inline></script>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('filepath', path.resolve('./test/foo.js'));
      done();
    });
  });
  it("should parse an inline <script>'s type", function(done) {
    ctx.html = '<script type="application/json" src="foo.json" inline></script>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('type', 'json');
      done();
    });
  });
  it('should generate a source object with custom compression setting', function(done) {
    ctx.compress = false;
    ctx.html = '<script src="foo.js" inline inline-compress></script>';
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(1);
      expect(ctx.sources[0]).to.have.property('compress', true);
      done();
    });
  });
  it('should not generate a source object if tag is included in options.ignore.tag', function(done) {
    ctx.html = '<script inline></script>';
    ctx.ignore = ['script'];
    parse(ctx, function(err) {
      expect(err).to.be(undefined);
      expect(ctx.sources).to.have.length(0);
      done();
    });
  });
});
