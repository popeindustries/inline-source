const { expect } = require('chai');
const { inlineSource } = require('../index.cjs');
const path = require('path');

describe('cjs compat', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, './fixtures'));
  });

  it('should inline sources that contain an "inline" attribute', async () => {
    const test = '<script inline src="foo.js"></script>';
    const html = await inlineSource(test, { compress: true });
    expect(html).to.eql('<script>var foo=this;console.log(foo);</script>');
  });
});
