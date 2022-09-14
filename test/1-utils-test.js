import { expect } from 'chai';
import {
  getAttributeString,
  getSourcepath,
  isFilepath,
  isIgnored,
  parseAttributes,
  parseProps,
} from '../src/utils.js';
import path from 'path';

describe('utils', () => {
  describe('isFilepath()', () => {
    it('should return "false" for missing string', () => {
      expect(isFilepath()).to.be.false;
    });
    it('should return "false" for empty string', () => {
      expect(isFilepath('')).to.be.false;
    });
    it('should return "true" for local filepath with extension', () => {
      expect(isFilepath('foo.js')).to.be.true;
    });
    it('should return "true" for local filepath without extension', () => {
      expect(isFilepath('foo')).to.be.true;
    });
    it('should return "true" for a relative filepath with extension', () => {
      expect(isFilepath('./foo.js')).to.be.true;
      expect(isFilepath('./foo.js')).to.be.true;
    });
    it('should return "true" for a relative filepath without extension', () => {
      expect(isFilepath('./foo')).to.be.true;
    });
    it('should return "true" for an absolute filepath with extension', () => {
      expect(isFilepath('/foo.js')).to.be.true;
      expect(isFilepath('c:\\foo.js')).to.be.true;
    });
    it('should return "true" for an absolute filepath without extension', () => {
      expect(isFilepath('/foo')).to.be.true;
      expect(isFilepath('c:\\foo')).to.be.true;
    });
    it('should return "false" for an absolute filepath without extension', () => {
      expect(isFilepath('/foo')).to.be.true;
      expect(isFilepath('c:\\foo')).to.be.true;
    });
    it('should return "false" for a multiline string', () => {
      expect(isFilepath('foo/\nbar.js')).to.be.false;
    });
    it('should return "false" for a single line html string', () => {
      expect(isFilepath('<html></html>')).to.be.false;
      expect(isFilepath('<link rel="stylesheet" href="foo.css" inline>')).to.be
        .false;
    });
    it('should return "false" for a multiline html string', () => {
      expect(isFilepath('<html>\n</html>')).to.be.false;
    });
  });

  describe('parseProps()', () => {
    it('should return an empty object if empty attributes passed', () => {
      expect(parseProps({}, 'inline')).to.eql({});
    });
    it('should return an empty object if no matching attributes', () => {
      expect(parseProps({ foo: 'foo' }, 'inline')).to.eql({});
    });
    it('should return an object with matching props', () => {
      expect(parseProps({ 'inline-foo': 'foo' }, 'inline')).to.eql({
        foo: 'foo',
      });
    });
  });

  describe('parseAttributes()', () => {
    it('should correctly parse boolean attributes', () => {
      expect(parseAttributes({ foo: '' })).to.eql({ foo: true });
    });
  });

  describe('getAttributeString()', () => {
    it('should return stringified attributes', () => {
      expect(getAttributeString({ foo: 'foo' }, 'inline', true)).to.eql(
        ' foo="foo"'
      );
    });
    it('should return stringified boolean attributes', () => {
      expect(getAttributeString({ foo: true }, 'inline', true)).to.eql(' foo');
    });
    it('should ignore prefixed attributes', () => {
      expect(
        getAttributeString({ foo: 'foo', inline: true }, 'inline', true)
      ).to.eql(' foo="foo"');
    });
    it('should ignore blacklisted attributes', () => {
      expect(
        getAttributeString(
          { foo: 'foo', inline: true, src: 'foo.js' },
          'inline',
          true
        )
      ).to.eql(' foo="foo"');
    });
  });

  describe('getSourcepath()', () => {
    it('should return a resolved path for relative source path and default rootpath', () => {
      expect(
        getSourcepath('./foo.css', path.resolve('./index.html'), process.cwd())
      ).to.eql([path.resolve(process.cwd(), 'foo.css'), '']);
      expect(
        getSourcepath(
          '../css/foo.css',
          path.resolve('./html/index.html'),
          process.cwd()
        )
      ).to.eql([path.resolve(process.cwd(), 'css/foo.css'), '']);
    });
    it('should return a resolved path for relative source path and custom rootpath', () => {
      expect(
        getSourcepath(
          './foo.css',
          path.resolve('./index.html'),
          path.resolve('www')
        )
      ).to.eql([path.resolve(process.cwd(), 'foo.css'), '']);
      expect(
        getSourcepath(
          '../css/foo.css',
          path.resolve('./html/index.html'),
          path.resolve('www')
        )
      ).to.eql([path.resolve(process.cwd(), 'css/foo.css'), '']);
    });
    it('should return a resolved path for absolute source path and default rootpath', () => {
      expect(
        getSourcepath('/foo.css', path.resolve('./index.html'), process.cwd())
      ).to.eql([path.resolve(process.cwd(), 'foo.css'), '']);
      expect(
        getSourcepath(
          '/css/foo.css',
          path.resolve('./html/index.html'),
          process.cwd()
        )
      ).to.eql([path.resolve(process.cwd(), 'css/foo.css'), '']);
    });
    it('should return a resolved path for absolute source path and custom rootpath', () => {
      expect(
        getSourcepath(
          '/dist/images/foo.png',
          path.resolve('./dist/index.html'),
          path.resolve('./dist')
        )
      ).to.eql([path.resolve('dist/dist/images/foo.png'), '']);
      expect(
        getSourcepath(
          '/images/foo.png',
          path.resolve('./dist/index.html'),
          path.resolve('./dist')
        )
      ).to.eql([path.resolve('dist/images/foo.png'), '']);
      expect(
        getSourcepath(
          '/foo.css',
          path.resolve('./index.html'),
          path.resolve('www')
        )
      ).to.eql([path.resolve('www', 'foo.css'), '']);
      expect(
        getSourcepath(
          '/css/foo.css',
          path.resolve('./html/index.html'),
          path.resolve('www')
        )
      ).to.eql([path.resolve('www', 'css/foo.css'), '']);
    });
    it('should return anchor if present', () => {
      expect(
        getSourcepath(
          './foo.svg#foo,bar',
          path.resolve('./index.html'),
          process.cwd()
        )
      ).to.eql([path.resolve(process.cwd(), 'foo.svg'), 'foo,bar']);
    });
    it('should strip query params if present', () => {
      expect(
        getSourcepath(
          './foo.css?v=12345',
          path.resolve('./index.html'),
          process.cwd()
        )
      ).to.eql([path.resolve(process.cwd(), 'foo.css'), '']);
      expect(
        getSourcepath('./foo.css?', path.resolve('./index.html'), process.cwd())
      ).to.eql([path.resolve(process.cwd(), 'foo.css'), '']);
      expect(
        getSourcepath(
          './foo.svg?v=12345#foo,bar',
          path.resolve('./index.html'),
          process.cwd()
        )
      ).to.eql([path.resolve(process.cwd(), 'foo.svg'), 'foo,bar']);
      expect(
        getSourcepath(
          './foo.svg?#foo,bar',
          path.resolve('./index.html'),
          process.cwd()
        )
      ).to.eql([path.resolve(process.cwd(), 'foo.svg'), 'foo,bar']);
    });
  });

  describe('isIgnored()', () => {
    it('should return "false" for default ignore values', () => {
      expect(isIgnored([], 'foo', 'foo')).to.be.false;
    });
    it('should return "true" for tag in ignore Array', () => {
      expect(isIgnored(['foo'], 'foo', 'bar')).to.be.true;
    });
    it('should return "true" for tag as String ignore', () => {
      expect(isIgnored('foo', 'foo', 'bar')).to.be.true;
    });
    it('should return "true" for type in ignore Array', () => {
      expect(isIgnored(['foo'], 'bar', 'foo')).to.be.true;
    });
    it('should return "true" for type as String ignore', () => {
      expect(isIgnored('foo', 'bar', 'foo')).to.be.true;
    });
  });
});
