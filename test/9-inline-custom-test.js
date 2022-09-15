import { expect } from 'chai';
import { fileURLToPath } from 'node:url';
import { handlebarsHandler } from './fixtures/handlebarsHandler.js';
import { inlineSource } from '../src/index.js';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normaliseNewLine(str) {
  return str.replace(/\r\n/g, '\n');
}

describe('inline <custom>', () => {
  before(function () {
    process.chdir(path.resolve(__dirname, './fixtures'));
  });

  it('should ignore tag types with no handler', async () => {
    const test = '<foo inline></foo>';
    const html = await inlineSource(test);
    expect(html).to.eql(test);
  });
  it('should inline sources for custom tags and custom handler', async () => {
    const test = '<foo inline></foo>';
    const html = await inlineSource(test, {
      handlers: [
        (source) => {
          if (source.tag == 'foo') source.content = 'foo';
          return Promise.resolve();
        },
      ],
    });
    expect(html).to.eql('<foo>foo</foo>');
  });
  it('should inline sources with overridden js handler', async () => {
    const test = '<script src="foo.js" inline></script>';
    const html = await inlineSource(test, {
      handlers: [
        (source) => {
          if (source.type == 'js') source.content = 'foo';
          return Promise.resolve();
        },
      ],
    });
    expect(html).to.eql('<script>foo</script>');
  });
  it('should inline sources with custom handler and special props', async () => {
    const test = '<script type="application/json" src="foo.json" inline inline-var="window.foo"></script>';
    const html = normaliseNewLine(
      await inlineSource(test, {
        handlers: [
          (source) => {
            if (source.type == 'json') source.content = source.props.var + ' = ' + source.fileContent;
            return Promise.resolve();
          },
        ],
      }),
    );
    expect(html).to.eql('<script type="application/json">window.foo = {\n  "foo": "foo"\n}\n</script>');
  });
  it('should inline handlebars sources with custom handler', async () => {
    const test = '<script type="text/x-handlebars-template" src="foo.handlebars" inline></script>';
    const html = normaliseNewLine(
      await inlineSource(test, {
        handlers: [handlebarsHandler],
      }),
    );
    expect(html).to.contain('container.escapeExpression(((helper = (helper = lookupProperty(helpers,"title")');
  });
});
