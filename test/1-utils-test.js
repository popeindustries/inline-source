var path = require('path')
	, utils = require('../lib/utils');

describe('utils', function () {
	describe('isFilepath()', function () {
		it('should return "false" for missing string', function () {
			utils.isFilepath().should.be.false;
		});
		it('should return "false" for empty string', function () {
			utils.isFilepath('').should.be.false;
		});
		it('should return "true" for local filepath with extension', function () {
			utils.isFilepath('foo.js').should.be.true;
		});
		it('should return "true" for local filepath without extension', function () {
			utils.isFilepath('foo').should.be.true;
		});
		it('should return "true" for a relative filepath with extension', function () {
			utils.isFilepath('./foo.js').should.be.true;
			utils.isFilepath('./foo.js').should.be.true;
		});
		it('should return "true" for a relative filepath without extension', function () {
			utils.isFilepath('./foo').should.be.true;
		});
		it('should return "true" for an absolute filepath with extension', function () {
			utils.isFilepath('/foo.js').should.be.true;
			utils.isFilepath('c:\\foo.js').should.be.true;
		});
		it('should return "true" for an absolute filepath without extension', function () {
			utils.isFilepath('/foo').should.be.true;
			utils.isFilepath('c:\\foo').should.be.true;
		});
		it('should return "false" for an absolute filepath without extension', function () {
			utils.isFilepath('/foo').should.be.true;
			utils.isFilepath('c:\\foo').should.be.true;
		});
		it('should return "false" for a multiline string', function () {
			utils.isFilepath('foo/\nbar.js').should.be.false;
		});
		it('should return "false" for a single line html string', function () {
			utils.isFilepath('<html></html>').should.be.false;
		});
		it('should return "false" for a multiline html string', function () {
			utils.isFilepath('<html>\n</html>').should.be.false;
		});
	});

	describe('parseProps()', function () {
		it('should return an empty object if empty attributes passed', function () {
			utils.parseProps({}, 'inline').should.eql({});
		});
		it('should return an empty object if no matching attributes', function () {
			utils.parseProps({ foo: 'foo' }, 'inline').should.eql({});
		});
		it('should return an object with matching props', function () {
			utils.parseProps({ 'inline-foo': 'foo' }, 'inline').should.eql({ foo: 'foo'});
		});
	});

	describe('parseAttributes()', function () {
		it('should correctly parse boolean attributes', function () {
			utils.parseAttributes({ foo: '' }).should.eql({ foo: true });
		});
	});

	describe('getAttributeString()', function () {
		it('should return stringified attributes', function () {
			utils.getAttributeString({ foo: 'foo' }, 'inline').should.eql(' foo="foo"');
		});
		it('should return stringified boolean attributes', function () {
			utils.getAttributeString({ foo: true }, 'inline').should.eql(' foo');
		});
		it('should ignore prefixed attributes', function () {
			utils.getAttributeString({ foo: 'foo', inline: true}, 'inline').should.eql(' foo="foo"');
		});
		it('should ignore blacklisted attributes', function () {
			utils.getAttributeString({ foo: 'foo', inline: true, src: 'foo.js'}, 'inline').should.eql(' foo="foo"');
		});
	});
});