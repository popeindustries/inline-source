'use strict';

const { expect } = require('chai');
const { getTagRegExp } = require('../lib/utils');
const fs = require('fs');
const path = require('path');
const parse = require('../lib/parse');

let ctx;

function createContext(attribute) {
  return {
    attribute: attribute,
    html: '',
    ignore: { tag: [], type: [] },
    re: getTagRegExp(attribute),
    rootpath: path.resolve('./test'),
    sources: []
  };
}

describe('parse', () => {
  beforeEach(() => {
    ctx = createContext('inline');
  });

  it('should ignore html with no matching inline tags', async () => {
    ctx.html = '<p>foo</p>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(0);
  });
  it('should ignore html with inlined style tag and "inline-block"', async () => {
    ctx.html = '<span style="display: inline-block;" ng-if="x>0"></span>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(0);
  });
  it('should generate a source object for a matching inline <script> tag', async () => {
    ctx.html = '<script inline></script>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('tag', 'script');
    expect(ctx.sources[0]).to.have.property('type', 'js');
  });
  it('should generate a source object for a matching inline <script> tag when attribute=false', async () => {
    ctx = createContext(false);
    ctx.html = '<script></script>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('tag', 'script');
    expect(ctx.sources[0]).to.have.property('type', 'js');
  });
  it('should generate a source object for a matching inline <link> tag', async () => {
    ctx.html = '<link inline>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('tag', 'link');
    expect(ctx.sources[0]).to.have.property('type', 'css');
  });
  it('should generate a source object for a matching inline <link> tag when attribute=false', async () => {
    ctx = createContext(false);
    ctx.html = '<link inline>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('tag', 'link');
    expect(ctx.sources[0]).to.have.property('type', 'css');
  });
  it('should generate source objects for all tags with "inline" attribute', async () => {
    ctx.html = fs.readFileSync(path.resolve('./test/fixtures/match.html'), 'utf-8');
    await parse(ctx);
    expect(ctx.sources).to.have.length(14);
  });
  it('should generate source objects for all tags when attribute=false', async () => {
    ctx = createContext(false);
    ctx.html = fs.readFileSync(path.resolve('./test/fixtures/match-any.html'), 'utf-8');
    await parse(ctx);
    expect(ctx.sources).to.have.length(14);
  });
  it('should synchronously generate source objects for all tags with "inline" attribute', () => {
    ctx.html = fs.readFileSync(path.resolve('./test/fixtures/match.html'), 'utf-8');
    parse(ctx);
    expect(ctx.sources).to.have.length(14);
  });
  it('should generate a source object for a matching inline <link> tag inside an ie conditional comment', async () => {
    ctx.html = '<!--[if IE 8 ]>\n  <link inline rel="stylesheet" href="css/ie.min.css" >\n<![endif]-->';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('tag', 'link');
    expect(ctx.sources[0]).to.have.property('type', 'css');
  });
  it('should generate a source object for a matching inline <link> tag with "inline=true"', async () => {
    ctx.html = '<link inline="true">';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('tag', 'link');
    expect(ctx.sources[0]).to.have.property('type', 'css');
  });
  it('should generate a source object for a matching inline <link> tag with "inline=inline"', async () => {
    ctx.html = '<link inline="inline">';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('tag', 'link');
    expect(ctx.sources[0]).to.have.property('type', 'css');
  });
  it("should parse an inline <script>'s source path", async () => {
    ctx.html = '<script src="foo.js" inline></script>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('filepath', path.resolve('./test/foo.js'));
  });
  it("should parse an inline <script>'s type", async () => {
    ctx.html = '<script type="application/json" src="foo.json" inline></script>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('type', 'json');
  });
  it('should generate a source object with custom compression setting', async () => {
    ctx.compress = false;
    ctx.html = '<script src="foo.js" inline inline-compress></script>';
    await parse(ctx);
    expect(ctx.sources).to.have.length(1);
    expect(ctx.sources[0]).to.have.property('compress', true);
  });
  it('should not generate a source object if tag is included in options.ignore.tag', async () => {
    ctx.html = '<script inline></script>';
    ctx.ignore = ['script'];
    await parse(ctx);
    expect(ctx.sources).to.have.length(0);
  });
});
