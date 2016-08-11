'use strict';

const expect = require('expect.js');
const path = require('path');
const utils = require('../lib/utils');

describe('utils', function () {
  describe('isFilepath()', function () {
    it('should return "false" for missing string', function () {
      expect(utils.isFilepath()).to.be.false;
    });
    it('should return "false" for empty string', function () {
      expect(utils.isFilepath('')).to.be.false;
    });
    it('should return "true" for local filepath with extension', function () {
      expect(utils.isFilepath('foo.js')).to.be.true;
    });
    it('should return "true" for local filepath without extension', function () {
      expect(utils.isFilepath('foo')).to.be.true;
    });
    it('should return "true" for a relative filepath with extension', function () {
      expect(utils.isFilepath('./foo.js')).to.be.true;
      expect(utils.isFilepath('./foo.js')).to.be.true;
    });
    it('should return "true" for a relative filepath without extension', function () {
      expect(utils.isFilepath('./foo')).to.be.true;
    });
    it('should return "true" for an absolute filepath with extension', function () {
      expect(utils.isFilepath('/foo.js')).to.be.true;
      expect(utils.isFilepath('c:\\foo.js')).to.be.true;
    });
    it('should return "true" for an absolute filepath without extension', function () {
      expect(utils.isFilepath('/foo')).to.be.true;
      expect(utils.isFilepath('c:\\foo')).to.be.true;
    });
    it('should return "false" for an absolute filepath without extension', function () {
      expect(utils.isFilepath('/foo')).to.be.true;
      expect(utils.isFilepath('c:\\foo')).to.be.true;
    });
    it('should return "false" for a multiline string', function () {
      expect(utils.isFilepath('foo/\nbar.js')).to.be.false;
    });
    it('should return "false" for a single line html string', function () {
      expect(utils.isFilepath('<html></html>')).to.be.false;
      expect(utils.isFilepath('<link rel="stylesheet" href="foo.css" inline>')).to.be.false;
    });
    it('should return "false" for a multiline html string', function () {
      expect(utils.isFilepath('<html>\n</html>')).to.be.false;
    });
  });

  describe('parseProps()', function () {
    it('should return an empty object if empty attributes passed', function () {
      expect(utils.parseProps({}, 'inline')).to.eql({});
    });
    it('should return an empty object if no matching attributes', function () {
      expect(utils.parseProps({ foo: 'foo' }, 'inline')).to.eql({});
    });
    it('should return an object with matching props', function () {
      expect(utils.parseProps({ 'inline-foo': 'foo' }, 'inline')).to.eql({ foo: 'foo'});
    });
  });

  describe('parseAttributes()', function () {
    it('should correctly parse boolean attributes', function () {
      expect(utils.parseAttributes({ foo: '' })).to.eql({ foo: true });
    });
  });

  describe('getAttributeString()', function () {
    it('should return stringified attributes', function () {
      expect(utils.getAttributeString({ foo: 'foo' }, 'inline', true)).to.eql(' foo="foo"');
    });
    it('should return stringified boolean attributes', function () {
      expect(utils.getAttributeString({ foo: true }, 'inline', true)).to.eql(' foo');
    });
    it('should ignore prefixed attributes', function () {
      expect(utils.getAttributeString({ foo: 'foo', inline: true }, 'inline', true)).to.eql(' foo="foo"');
    });
    it('should ignore blacklisted attributes', function () {
      expect(utils.getAttributeString({ foo: 'foo', inline: true, src: 'foo.js' }, 'inline', true)).to.eql(' foo="foo"');
    });
  });

  describe('getSourcepath()', function () {
    it('should return a resolved path for relative source path and default rootpath', function () {
      expect(utils.getSourcepath('./foo.css', path.resolve('./index.html'), process.cwd())).to.eql([path.resolve(process.cwd(), 'foo.css'), '']);
      expect(utils.getSourcepath('../css/foo.css', path.resolve('./html/index.html'), process.cwd())).to.eql([path.resolve(process.cwd(), 'css/foo.css'), '']);
    });
    it('should return a resolved path for relative source path and custom rootpath', function () {
      expect(utils.getSourcepath('./foo.css', path.resolve('./index.html'), path.resolve('www'))).to.eql([path.resolve(process.cwd(), 'foo.css'), '']);
      expect(utils.getSourcepath('../css/foo.css', path.resolve('./html/index.html'), path.resolve('www'))).to.eql([path.resolve(process.cwd(), 'css/foo.css'), '']);
    });
    it('should return a resolved path for absolute source path and default rootpath', function () {
      expect(utils.getSourcepath('/foo.css', path.resolve('./index.html'), process.cwd())).to.eql([path.resolve(process.cwd(), 'foo.css'), '']);
      expect(utils.getSourcepath('/css/foo.css', path.resolve('./html/index.html'), process.cwd())).to.eql([path.resolve(process.cwd(), 'css/foo.css'), '']);
    });
    it('should return a resolved path for absolute source path and custom rootpath', function () {
      expect(utils.getSourcepath('/dist/images/foo.png', path.resolve('./dist/index.html'), path.resolve('./dist'))).to.eql([path.resolve('dist/dist/images/foo.png'), '']);
      expect(utils.getSourcepath('/images/foo.png', path.resolve('./dist/index.html'), path.resolve('./dist'))).to.eql([path.resolve('dist/images/foo.png'), '']);
      expect(utils.getSourcepath('/foo.css', path.resolve('./index.html'), path.resolve('www'))).to.eql([path.resolve('www', 'foo.css'), '']);
      expect(utils.getSourcepath('/css/foo.css', path.resolve('./html/index.html'), path.resolve('www'))).to.eql([path.resolve('www', 'css/foo.css'), '']);
    });
    it('should return anchor if present', function () {
      expect(utils.getSourcepath('./foo.svg#foo,bar', path.resolve('./index.html'), process.cwd())).to.eql([path.resolve(process.cwd(), 'foo.svg'), 'foo,bar']);
    });
  });

  describe('isIgnored()', function () {
    it('should return "false" for default ignore values', function () {
      expect(utils.isIgnored([], 'foo', 'foo')).to.be.false;
    });
    it('should return "true" for tag in ignore Array', function () {
      expect(utils.isIgnored(['foo'], 'foo', 'bar')).to.be.true;
    });
    it('should return "true" for tag as String ignore', function () {
      expect(utils.isIgnored('foo', 'foo', 'bar')).to.be.true;
    });
    it('should return "true" for type in ignore Array', function () {
      expect(utils.isIgnored(['foo'], 'bar', 'foo')).to.be.true;
    });
    it('should return "true" for type as String ignore', function () {
      expect(utils.isIgnored('foo', 'bar', 'foo')).to.be.true;
    });
  });
});