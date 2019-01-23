'use strict';

const { expect } = require('chai');
const { inlineSource: inline } = require('..');

describe('inline <link>', () => {
  before(function() {
    process.chdir(require('path').resolve(__dirname, './fixtures'));
  });

  it('should ignore commented sources', async () => {
    const test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(test);
  });
  it('should ignore sources that don\'t contain an "inline" attribute', async () => {
    const test = '<link rel="stylesheet" href="foo.js">';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(test);
  });
  it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', async () => {
    const test = '<link rel="stylesheet" href="inline.js">';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(test);
  });
  it('should ignore rel=preload/prefetch sources', async () => {
    const test = '<link rel="preload" href="foo.css">';
    const html = await inline(test, { compress: true, attribute: false });
    expect(html).to.eql(test);
  });
  it('should inline sources that contain an "inline" attribute', async () => {
    const test = '<link inline rel="stylesheet" href="foo.css">';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<style>body{background-color:#fff}</style>');
  });
  it('should inline sources that contain an "inline" attribute on a line with leading whitespace', async () => {
    const test = '    <link inline rel="stylesheet" href="foo.css">';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('    <style>body{background-color:#fff}</style>');
  });
  it('should inline sources that contain an "inline" attribute at the end of the <link> tag', async () => {
    const test = '<link rel="stylesheet" href="foo.css" inline>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<style>body{background-color:#fff}</style>');
  });
  it('should inline sources that contain an "inline" attribute at the end of the <link> tag surrounded by whitespace', async () => {
    const test = '<link rel="stylesheet" href="foo.css" inline >';
    const html = await inline(test, { compress: true });
    expect(html).to.eql('<style>body{background-color:#fff}</style>');
  });
  it('should inline favicon sources', async () => {
    const test = '<link rel="icon" type="image/png" href="foo.png" inline >';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(
      '<link rel="icon" type="image/png" href="data:image/png;base64,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"/>'
    );
  });
  it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', async () => {
    const test = '<link inline rel="stylesheet" href="bar.css">';
    const html = await inline(test, { compress: true, swallowErrors: true });
    expect(html).to.eql('<link rel="stylesheet" href="bar.css">');
  });
  it('should not inline content when options.ignore includes "link"', async () => {
    const test = '<link inline rel="stylesheet" href="foo.css">';
    const html = await inline(test, { compress: true, ignore: 'link' });
    expect(html).to.eql('<link inline rel="stylesheet" href="foo.css">');
  });
  it('should not inline content when options.ignore includes "css"', async () => {
    const test = '<link inline rel="stylesheet" href="foo.css">';
    const html = await inline(test, { compress: true, ignore: 'css' });
    expect(html).to.eql('<link inline rel="stylesheet" href="foo.css">');
  });
  it('should inline all sources when attribute=false', async () => {
    const test = '<link rel="stylesheet" href="foo.css">';
    const html = await inline(test, { attribute: false, compress: true });
    expect(html).to.eql('<style>body{background-color:#fff}</style>');
  });
});
