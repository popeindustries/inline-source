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
});