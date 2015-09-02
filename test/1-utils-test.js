'use strict';

var expect = require('expect.js')
	, utils = require('../lib/utils');

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