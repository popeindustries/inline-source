'use strict';

const { expect } = require('chai');
const { inlineSource: inline } = require('..');

function normaliseNewLine(str) {
  return str.replace(/\r\n/g, '\n');
}

describe('inline <img>', () => {
  before(function () {
    process.chdir(require('path').resolve(__dirname, './fixtures'));
  });

  it('should ignore commented sources', async () => {
    const test = '<!-- <img inline src="foo.png" /> -->';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(test);
  });
  it('should not inline content when options.ignore includes "svg"', async () => {
    const test = '<img inline src="foo.svg" />';
    const html = await inline(test, { compress: true, ignore: ['svg'] });
    expect(html).to.eql('<img inline src="foo.svg" />');
  });
  it('should not inline data:uri src content', async () => {
    const test =
      '<img id="foo" inline src="data:image/png;base64,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"/>';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(
      '<img id="foo" inline src="data:image/png;base64,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"/>'
    );
  });
  it('should inline png sources that contain an "inline" attribute', async () => {
    const test = '<img id="foo" inline src="foo.png" />';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(
      '<img id="foo" src="data:image/png;base64,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"/>'
    );
  });
  it('should inline svg sources that contain an "inline" attribute', async () => {
    const test = '<img inline src="foo.svg" />';
    const html = normaliseNewLine(await inline(test, { compress: false }));
    expect(html).to
      .eql(`<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200">
<circle cx="50" cy="50" r="25"/>
</svg>`);
  });
  it('should inline multiple duplicate svg sources', async () => {
    const test =
      '<img inline src="right.svg" />\n<img inline src="right.svg" />\n<img inline src="left.svg" />\n<img inline src="left.svg" />';
    const html = normaliseNewLine(await inline(test, { compress: true }));
    expect(html).to.eql(
      `<svg viewBox="0 0 32 32"><path d="M6 15h15v2H6z"/><path d="M20 20v-8l5 4-5 4z"/></svg>\n<svg viewBox="0 0 32 32"><path d="M6 15h15v2H6z"/><path d="M20 20v-8l5 4-5 4z"/></svg>\n<svg viewBox="0 0 32 32"><path d="M26 17H11v-2h15z"/><path d="M12 12v8l-5-4 5-4z"/></svg>\n<svg viewBox="0 0 32 32"><path d="M26 17H11v-2h15z"/><path d="M12 12v8l-5-4 5-4z"/></svg>`
    );
  });
  it('should inline svg sources that contain an "inline" attribute and line break in <svg> tag', async () => {
    const test = '<img inline src="bar.svg" />';
    const html = await inline(test, { compress: false });
    expect(html).to
      .eql(`<svg id="bar" x="0px" y="0px" xml:space="preserve" viewBox="0 0 100 36">
<rect y="0.7" width="12.3" height="35.1"/>
</svg>`);
  });
  it('should inline svg sources that contain an "inline" attribute, preserving other attributes', async () => {
    const test = '<img id="foo" class="foo bar" inline src="foo.svg" />';
    const html = await inline(test, { compress: false });
    expect(html).to
      .eql(`<svg id="foo" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200" class="foo bar">
<circle cx="50" cy="50" r="25"/>
</svg>`);
  });
  it('should inline svg sources that contain an "inline" attribute, removing the alt attribute', async () => {
    const test = '<img inline src="foo.svg" alt="foo"/>';
    const html = await inline(test, { compress: false });
    expect(html).to
      .eql(`<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200">
<circle cx="50" cy="50" r="25"/>
</svg>`);
  });
  it('should inline svg sources that contain an "inline" attribute, removing the alt attribute and preserving others', async () => {
    const test =
      '<img id="foo" class="foo bar" inline src="foo.svg" alt="foo"/>';
    const html = await inline(test, { compress: false });
    expect(html).to
      .eql(`<svg id="foo" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200" class="foo bar">
<circle cx="50" cy="50" r="25"/>
</svg>`);
  });
  it('should inline svg sources that contain an "inline" attribute, preserving nested "src" attributes', async () => {
    const test = '<img id="boo" inline src="boo.svg" />';
    const html = await inline(test, { compress: true });
    expect(html).to.contain('<image src="boo.png" xlink:href=""/>');
  });
  it('should inline compressed svg sources with options.compressed="true"', async () => {
    const test = '<img inline src="foo.svg" />';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(
      '<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200"><circle cx="50" cy="50" r="25"/></svg>'
    );
  });
  it('should inline compressed svg symbol sources with options.compressed="true"', async () => {
    const test = '<img inline src="foo-symbol.svg" />';
    const html = await inline(test, { compress: true });
    expect(html).to.eql(
      '<svg x="0" y="0" viewBox="0 0 100 100"><symbol id="foo"><circle cx="50" cy="50" r="30"/></symbol></svg>'
    );
  });
  it('should inline svg sources as base64 if options.svgAsImage="true"', async () => {
    const test = '<img inline src="foo.svg" />';
    const html = await inline(test, { svgAsImage: true, compress: true });
    expect(html).to.contain('<img src="data:image/svg+xml;charset=utf8');
  });
  it('should inline svg sources as base64 if svgAsImage="true"', async () => {
    const test = '<img inline inline-svgAsImage src="foo.svg" />';
    const html = await inline(test, { compress: true });
    expect(html).to.contain('<img src="data:image/svg+xml;charset=utf8');
  });
  it('should inline svg sources fragments', async () => {
    const test =
      '<img inline src="symbols.svg#icon-close,icon-minus,icon-plus" />';
    const html = normaliseNewLine(await inline(test, { compress: true }));
    expect(html).to.eql(
      '<svg id="symbols" style="display:none;">\n  <symbol id="icon-close" viewBox="0 0 50 50">\n    <polygon points="80.76,24.19 75.81,19.24 50,45.05 24.19,19.24 19.24,24.19 45.05,50 19.24,75.81 24.19,80.76 50,54.95 75.81,80.76 80.76,75.81 54.95,50 "/>\n  </symbol>\n  \n  <symbol id="icon-minus">\n      <rect x="10" y="46.5" width="80" height="7"/>\n  </symbol>\n  <symbol id="icon-plus">\n    <polygon points="90,46.5 53.5,46.5 53.5,10 46.5,10 46.5,46.5 10,46.5 10,53.5 46.5,53.5 46.5,90 53.5,90 53.5,53.5 90,53.5 "/>\n  </symbol>\n  \n  \n</svg>'
    );
  });
  it('should inline svg sources when attribute=false', async () => {
    const test = '<img src="foo.svg" />';
    const html = normaliseNewLine(
      await inline(test, { attribute: false, compress: false })
    );
    expect(html).to
      .eql(`<svg id="Layer_1" x="100px" y="100px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 200 200">
<circle cx="50" cy="50" r="25"/>
</svg>`);
  });
  it('should skip inlining img sources if empty "src"', async () => {
    const test = '<img id="foo" src="" /><img id="foo" src="foo.png" />';
    const html = await inline(test, { compress: true, attribute: false });
    expect(html).to.eql(
      '<img id="foo" src="" /><img id="foo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABjlJREFUeNrsnT9oG1ccx23jQd7keHFwBwlikAO1ZS9WM0mZXE1GXkziIbQEDIY20EKzlWwtdCiBQCAEMjghi4UnxZOtyZUz2IqHJtBCO9TYSxpt1eZ+7155uZ7u3r3TvSe9u/s9juDYd8/6ffT7/96TRy8vL0doyI0xQkCwCBbBIlgEi2ARAoJFsIY9xuVvvTj/693b04vzs273n7iLnclM5PLXCnML2ckr8k+NypQ7nQ9/79a3//zjt+QpS3FpeaW6BnZqYEGhnj19mABt8htQrvVbd6evfhLVZ0Gnkk2KyfjyxRMZGQNgwfqSTYrzau6/igQLBphIP+U5WocHgWohgoXYl6rMIFAzxoQP/54qWLAkSkopgydYBItgESwayroOEat8FF+4MplMt9uNabqrHRbK+uLici4/65n0tg6bMaKmERb0aLV2W1DNF+bmcQEWKlBUZ+n1WVCoza3vZPoeULrNrfsydyYTFkit1jZCebQ7X35lPq8xPda3EfYpxkuyY5kcWPBTfUfMlepaimDBAKNYEx4PtYIQc1iLyxFnKFeqqYBlry/NRpwk+gzxgBVogDz/RFbl18OFGRpriSqT0lz+mpjUs6cPkYVOX51p7r+CBiH8efPKTpmZo44P7DdB76AyKHFYa790o5zqrgMqZLFHK8wtOGudVMMSN/zx09bhAf/vXqPe3zwJMcNAIeGnWAdir7GTyWQ87xH4/kTBgpDwR372BZ/FPfr67bt+k7x7+yYtSWnrsBl1hl+axsJSHA2RH+DqO7GEU/NLGjCn3W6dYZEEJt/pvB9whqE+dditb29u3e+jfwD5XbszMElxqVSY+9SPPmDBbNsnrwcTE9TDYruUwvZb4O9268+5a8ezSMRKNyriSZC44R5cUGeA1t2h1tL8C7v/jd3PtQMh4t63D8o3q/K4WT2wUq1p7YjpaitD8p9/+l5mHw78lJMUBEas7E9mqJjWjqvGcgea9fL5E7z00mflwvV5l/zM3SD2OZ30am2juBSpycMSFCf9ONWGeNFw+SN1u52QneLf7DXS6KS4vwMv6LXy5HZwK9LQIJZY4OoVw1peVEHKySsemgWxc7lZ3pYCnfbJkSAnwp3Ku++wx/LNz2V2ig4NFgLZ6tqGyz0hVCG0tY+PUBJ6mka5UtURxeDvxW/SMM0QTkcQyKBuMI3eLii+o9AAXcaI2GKiz4LOB8oM01i/5aapVp6ed6hkHCxoBwxN3pX833IXQuWuodJ0u+M4bxYsv/UrT3/hLGJYr1m+IcHKmrBu1CxYyDn9iuq9Rh1O3eXX+f2siyCffFj/dt6HDIszqmApiIb2FrUJvyQe1QwumJ7TTqen/xMgm70iwwi5fqfzgRmgddTGKgxmioslGa1UWP0ogOVHCiKxmgOGANPzFIDn9ILx+NEPLsVkS0Swx3vfPBjkIqPGDB7axHKF7ORUb2HII0PfqmFp9MRAd90o0Cy/8MSEvPPF1x5x7eLsI7V8wPyscMFvgaoyFVup1lyqGifNErRiPJfj+aqEvLdGGcDoW22MYZBSBivUOgV0hJthpxOiFmGwZGKCjOIPrTbECxIsgrnio9Wx6UsSOMFsdjJsUq6wsaXMwe/ubAe+LNYOdGaq+Fq+0LUb85WwJbfCg4DKYAEEahHnAn1vuuRZrLRPWvq8jJ2jnZplhpwX8vX2yWtXH5n1s9rHR55P4UeSdWUfQ+07ob75x/vI8m8+9FFHgLPrh6bCCY046IRcXMdmEL9eY7xhMcevdk64Kj/Djzcs5tecKYUCV7CzrfxFGnTeEIrQ3G8oIaXpU07MOpwJ5xVRv9g2X03b4cZHDBvQr4vzM/HZO//Yd6B27ct0WMyOHj/6sbi0XK5UJdtVlgkfNHRv1zIRFpcfFzvAmcvPelJDyEM10z5uDWYbqrmwOA5Wr7BT1h9T2YFv+4sBLKdLGvppavqoAoJFsAgWwUohLMPPwpsFS3zYMnkjsMASwZLfDJSAIbM5SQRL3548A4fMydoABy//ucNxN0CZRZOxQOX03AiaMFKS+8ClPrXbXuPaUd7SNsFPwfrkF+JG5f+ik3VQ9dfTsBvvTFaosDsoR+nPX1EGT7AIFsEiWASLEBAsgjXs8a8AAwBZnxYQS3wEOgAAAABJRU5ErkJggg=="/>'
    );
  });
});
