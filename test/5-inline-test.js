'use strict';

var inline = require('..')
	, inlineSync = require('..').sync
	, path = require('path')
	, should = require('should');

describe('inline', function () {
	before(function () {
		process.chdir('./test/fixtures');
	});

	describe('<script>', function () {
		describe('async', function () {
			it('should ignore commented sources', function (done) {
				var test = '<!-- <script inline src="foo.js"></script> -->';
				inline(test, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should ignore sources that don\'t contain an "inline" attribute', function (done) {
				var test = '<script src="foo.js"></script>';
				inline(test, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function (done) {
				var test = '<script src="inline.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute', function (done) {
				var test = '<script inline src="foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline multiple sources that contain an "inline" attribute', function (done) {
				var test = '<script inline src="foo.js"></script>\n<script inline src="bar.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>\n<script>var bar=this;console.log(bar);</script>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function (done) {
				var test = '		<script inline src="foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('		<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <script> tag', function (done) {
				var test = '<script src="foo.js" inline></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <script> tag and the file name contains number', function (done) {
				var test = '<script src="foo01.js" inline></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <script> tag surrounded by whitespace', function (done) {
				var test = '<script src="foo.js" inline ></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function (done) {
				var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
				inline(test, { compress: true, swallowErrors: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script src="baz.js"></script>\n<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should return an error when options.swallowErrors is "false"', function (done) {
				var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.exist(err);
					done();
				});
			});
			it('should preserve order of multiple inlined items', function (done) {
				var test = '<script inline src="bar.js"></script>\n<script inline src="foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var bar=this;console.log(bar);</script>\n<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should allow specification of a custom attribute name', function (done) {
				var test = '<script data-inline src="bar.js"></script>';
				inline(test, { compress: true, attribute: 'data-inline' }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var bar=this;console.log(bar);</script>');
					done();
				});
			});
			it('should load html source content if none specified', function (done) {
				inline(path.resolve('test.html'), function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources referenced by relative path', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources referenced by absolute path relative to project directory', function (done) {
				var test = '<script inline src="/nested/foo.js"></script>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo=this;console.log(foo);</script>');
					done();
				});
			});
			it('should inline sources referenced by absolute path relative to passed rootpath directory', function (done) {
				var test = '<script inline src="/bar.js"></script>';
				inline(test, { compress: true, rootpath: path.resolve('nested/deep') }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var bar=this;console.log(bar);</script>');
					done();
				});
			});
			it('should not compress inlined content when options.compressed is "false"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>var foo = this;\nconsole.log(foo);</script>');
					done();
				});
			});
			it('should replace content ignoring special string.replace tokens', function (done) {
				var test = '<script inline src="./nested/tokens.js"></script>';
				inline(test, { compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>e&$&&(doSomething());</script>');
					done();
				});
			});
			it('should not inline content when options.ignore includes "script"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true, ignore: ['script'] }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script inline src="./nested/foo.js"></script>');
					done();
				});
			});
			it('should not inline content when options.ignore includes "js"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true, ignore: ['js'] }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script inline src="./nested/foo.js"></script>');
					done();
				});
			});
			it('should not inline content when v3.x style options.ignore.type includes "js"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true, ignore: { type: ['js'] } }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script inline src="./nested/foo.js"></script>');
					done();
				});
			});
			it('should not inline content when v3.x style options.ignore.tag includes "script"', function (done) {
				var test = '<script inline src="./nested/foo.js"></script>';
				inline(test, { compress: true, ignore: { tag: 'script' } }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script inline src="./nested/foo.js"></script>');
					done();
				});
			});
			it('should preserve whitespace while inlining content when options.pretty is "true"', function (done) {
				inline(path.resolve('multiline.html'), { pretty: true, compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>\n  var foo = \'foo\'\n    , bar = \'bar\';\n\n  function baz () {\n    console.log(foo, bar);\n  }\n\n  baz();\n  </script>\n</head>\n<body>\n\n</body>\n</html>');
					done();
				});
			});
			it('should parse html templates for inlineable content', function (done) {
				inline(path.resolve('head.nunjs'), function (err, html) {
					should.not.exist(err);
					html.should.eql('<head>\n  <meta charset="utf-8">\n  <title>{{ title }}</title>\n  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />\n\n  {% if js %}\n    <script>var foo=this;console.log(foo);</script>\n  {% endif %}\n\n  <link rel="stylesheet" href={{ assets[\'index.css\'] }}>\n\n</head>');
					done();
				});
			});
			it('should escape closing <script> tags in content', function (done) {
				var test = '<script src="scriptTag.js" inline></script>';
				inline(test, { compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql("<script>(a='<script>document.domain=\"'+document.domain+'\";\x3c/script>');</script>");
					done();
				});
			});
		});

		describe('sync', function () {
			it('should ignore commented sources', function () {
				var test = '<!-- <script inline src="foo.js"></script> -->';
				var html = inlineSync(test);
				html.should.eql(test);
			});
			it('should inline sources that contain an "inline" attribute', function () {
				var test = '<script inline src="foo.js"></script>';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<script>var foo=this;console.log(foo);</script>');
			});
			it('should inline multiple sources that contain an "inline" attribute', function () {
				var test = '<script inline src="foo.js"></script>\n<script inline src="bar.js"></script>';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<script>var foo=this;console.log(foo);</script>\n<script>var bar=this;console.log(bar);</script>');
			});
			it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function () {
				var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
				var html = inlineSync(test, { compress: true, swallowErrors: true });
				html.should.eql('<script src="baz.js"></script>\n<script>var foo=this;console.log(foo);</script>');
			});
			it('should return an error when options.swallowErrors is "false"', function () {
				var test = '<script inline src="baz.js"></script>\n<script inline src="foo.js"></script>';
				try {
					var html = inlineSync(test, { compress: true });
					should.not.exist(html);
				} catch (err) {
					should.exist(err);
				}
			});
			it('should preserve order of multiple inlined items', function () {
				var test = '<script inline src="bar.js"></script>\n<script inline src="foo.js"></script>';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<script>var bar=this;console.log(bar);</script>\n<script>var foo=this;console.log(foo);</script>');
			});
			it('should load html source content if none specified', function () {
				var html = inlineSync(path.resolve('test.html'));
				html.should.eql('<script>var foo=this;console.log(foo);</script>');
			});
			it('should parse html templates for inlineable content', function () {
				var html = inlineSync(path.resolve('head.nunjs'));
				html.should.eql('<head>\n  <meta charset="utf-8">\n  <title>{{ title }}</title>\n  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />\n\n  {% if js %}\n    <script>var foo=this;console.log(foo);</script>\n  {% endif %}\n\n  <link rel="stylesheet" href={{ assets[\'index.css\'] }}>\n\n</head>');
			});
		});
	});

	describe('<link>', function () {
		describe('async', function () {
			it('should ignore commented sources', function (done) {
				var test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should ignore sources that don\'t contain an "inline" attribute', function (done) {
				var test = '<link rel="stylesheet" href="foo.js">';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should ignore sources that don\'t contain an "inline" attribute but contain the string "inline"', function (done) {
				var test = '<link rel="stylesheet" href="inline.js">';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute', function (done) {
				var test = '<link inline rel="stylesheet" href="foo.css">';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<style>body{background-color:#fff}</style>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute on a line with leading whitespace', function (done) {
				var test = '		<link inline rel="stylesheet" href="foo.css">';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('		<style>body{background-color:#fff}</style>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <link> tag', function (done) {
				var test = '<link rel="stylesheet" href="foo.css" inline>';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<style>body{background-color:#fff}</style>');
					done();
				});
			});
			it('should inline sources that contain an "inline" attribute at the end of the <link> tag surrounded by whitespace', function (done) {
				var test = '<link rel="stylesheet" href="foo.css" inline >';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<style>body{background-color:#fff}</style>');
					done();
				});
			});
			it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function (done) {
				var test = '<link inline rel="stylesheet" href="bar.css">';
				inline(test, { compress: true, swallowErrors: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<link rel="stylesheet" href="bar.css">');
					done();
				});
			});
			it('should not inline content when options.ignore includes "link"', function (done) {
				var test = '<link inline rel="stylesheet" href="foo.css">';
				inline(test, { compress: true, ignore: 'link' }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<link inline rel="stylesheet" href="foo.css">');
					done();
				});
			});
			it('should not inline content when options.ignore includes "css"', function (done) {
				var test = '<link inline rel="stylesheet" href="foo.css">';
				inline(test, { compress: true, ignore: 'css' }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<link inline rel="stylesheet" href="foo.css">');
					done();
				});
			});
		});

		describe('sync', function () {
			it('should ignore commented sources', function () {
				var test = '<!-- <link inline rel="stylesheet" href="foo.css"> -->';
				var html = inlineSync(test, { compress: true });
				html.should.eql(test);
			});
			it('should inline sources that contain an "inline" attribute', function () {
				var test = '<link inline rel="stylesheet" href="foo.css">';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<style>body{background-color:#fff}</style>');
			});
			it('should remove the "inline" attribute for sources that can\'t be found when options.swallowErrors is "true"', function () {
				var test = '<link inline rel="stylesheet" href="bar.css">';
				var html = inlineSync(test, { compress: true, swallowErrors: true });
				html.should.eql('<link rel="stylesheet" href="bar.css">');
			});
		});
	});

	describe('<img>', function () {
		describe('async', function () {
			it('should ignore commented sources', function (done) {
				var test = '<!-- <img inline src="foo.png" /> -->';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should not inline content when options.ignore includes "svg"', function (done) {
				var test = '<img inline src="foo.svg" />';
				inline(test, { compress: true, ignore: ['svg'] }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<img inline src="foo.svg" />');
					done();
				});
			});
			it('should inline png sources that contain an "inline" attribute', function (done) {
				var test = '<img id="foo" inline src="foo.png" />';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<img id="foo" src="data:image/png;base64,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" />');
					done();
				});
			});
			it('should inline svg sources that contain an "inline" attribute', function (done) {
				var test = '<img inline src="foo.svg" />';
				inline(test, { compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<svg x=\"0\" y=\"0\" viewbox=\"0 0 100 100\">\n<circle cx=\"50\" cy=\"50\" r=\"25\"/>\n</svg>');
					done();
				});
			});
			it('should inline svg sources that contain an "inline" attribute, preserving other attributes', function (done) {
				var test = '<img id="foo" class="foo bar" inline src="foo.svg" />';
				inline(test, { compress: false }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<svg id=\"foo\" class=\"foo bar\" x=\"0\" y=\"0\" viewbox=\"0 0 100 100\">\n<circle cx=\"50\" cy=\"50\" r=\"25\"/>\n</svg>');
					done();
				});
			});
			it('should inline compressed svg sources with options.compressed="true"', function (done) {
				var test = '<img inline src="foo.svg" />';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<svg x=\"0\" y=\"0\" viewbox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"25\"/></svg>');
					done();
				});
			});
			it('should inline svg sources as base64 if options.svgAsImage="true"', function (done) {
				var test = '<img inline src="foo.svg" />';
				inline(test, { svgAsImage: true, compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<img src=\"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2225%22%2F%3E%3C%2Fsvg%3E\" />');
					done();
				});
			});
			it('should inline svg sources as base64 if svgAsImage="true"', function (done) {
				var test = '<img inline inline-svgAsImage src="foo.svg" />';
				inline(test, { compress: true }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<img src=\"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2225%22%2F%3E%3C%2Fsvg%3E\" />');
					done();
				});
			});
		});

		describe('sync', function () {
			it('should ignore commented sources', function () {
				var test = '<!-- <img inline src="foo.png" /> -->';
				var html = inlineSync(test, { compress: true });
				html.should.eql(test);
			});
			it('should inline png sources that contain an "inline" attribute', function () {
				var test = '<img inline src="foo.png" />';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABjlJREFUeNrsnT9oG1ccx23jQd7keHFwBwlikAO1ZS9WM0mZXE1GXkziIbQEDIY20EKzlWwtdCiBQCAEMjghi4UnxZOtyZUz2IqHJtBCO9TYSxpt1eZ+7155uZ7u3r3TvSe9u/s9juDYd8/6ffT7/96TRy8vL0doyI0xQkCwCBbBIlgEi2ARAoJFsIY9xuVvvTj/693b04vzs273n7iLnclM5PLXCnML2ckr8k+NypQ7nQ9/79a3//zjt+QpS3FpeaW6BnZqYEGhnj19mABt8htQrvVbd6evfhLVZ0Gnkk2KyfjyxRMZGQNgwfqSTYrzau6/igQLBphIP+U5WocHgWohgoXYl6rMIFAzxoQP/54qWLAkSkopgydYBItgESwayroOEat8FF+4MplMt9uNabqrHRbK+uLici4/65n0tg6bMaKmERb0aLV2W1DNF+bmcQEWKlBUZ+n1WVCoza3vZPoeULrNrfsydyYTFkit1jZCebQ7X35lPq8xPda3EfYpxkuyY5kcWPBTfUfMlepaimDBAKNYEx4PtYIQc1iLyxFnKFeqqYBlry/NRpwk+gzxgBVogDz/RFbl18OFGRpriSqT0lz+mpjUs6cPkYVOX51p7r+CBiH8efPKTpmZo44P7DdB76AyKHFYa790o5zqrgMqZLFHK8wtOGudVMMSN/zx09bhAf/vXqPe3zwJMcNAIeGnWAdir7GTyWQ87xH4/kTBgpDwR372BZ/FPfr67bt+k7x7+yYtSWnrsBl1hl+axsJSHA2RH+DqO7GEU/NLGjCn3W6dYZEEJt/pvB9whqE+dditb29u3e+jfwD5XbszMElxqVSY+9SPPmDBbNsnrwcTE9TDYruUwvZb4O9268+5a8ezSMRKNyriSZC44R5cUGeA1t2h1tL8C7v/jd3PtQMh4t63D8o3q/K4WT2wUq1p7YjpaitD8p9/+l5mHw78lJMUBEas7E9mqJjWjqvGcgea9fL5E7z00mflwvV5l/zM3SD2OZ30am2juBSpycMSFCf9ONWGeNFw+SN1u52QneLf7DXS6KS4vwMv6LXy5HZwK9LQIJZY4OoVw1peVEHKySsemgWxc7lZ3pYCnfbJkSAnwp3Ku++wx/LNz2V2ig4NFgLZ6tqGyz0hVCG0tY+PUBJ6mka5UtURxeDvxW/SMM0QTkcQyKBuMI3eLii+o9AAXcaI2GKiz4LOB8oM01i/5aapVp6ed6hkHCxoBwxN3pX833IXQuWuodJ0u+M4bxYsv/UrT3/hLGJYr1m+IcHKmrBu1CxYyDn9iuq9Rh1O3eXX+f2siyCffFj/dt6HDIszqmApiIb2FrUJvyQe1QwumJ7TTqen/xMgm70iwwi5fqfzgRmgddTGKgxmioslGa1UWP0ogOVHCiKxmgOGANPzFIDn9ILx+NEPLsVkS0Swx3vfPBjkIqPGDB7axHKF7ORUb2HII0PfqmFp9MRAd90o0Cy/8MSEvPPF1x5x7eLsI7V8wPyscMFvgaoyFVup1lyqGifNErRiPJfj+aqEvLdGGcDoW22MYZBSBivUOgV0hJthpxOiFmGwZGKCjOIPrTbECxIsgrnio9Wx6UsSOMFsdjJsUq6wsaXMwe/ubAe+LNYOdGaq+Fq+0LUb85WwJbfCg4DKYAEEahHnAn1vuuRZrLRPWvq8jJ2jnZplhpwX8vX2yWtXH5n1s9rHR55P4UeSdWUfQ+07ob75x/vI8m8+9FFHgLPrh6bCCY046IRcXMdmEL9eY7xhMcevdk64Kj/Djzcs5tecKYUCV7CzrfxFGnTeEIrQ3G8oIaXpU07MOpwJ5xVRv9g2X03b4cZHDBvQr4vzM/HZO//Yd6B27ct0WMyOHj/6sbi0XK5UJdtVlgkfNHRv1zIRFpcfFzvAmcvPelJDyEM10z5uDWYbqrmwOA5Wr7BT1h9T2YFv+4sBLKdLGvppavqoAoJFsAgWwUohLMPPwpsFS3zYMnkjsMASwZLfDJSAIbM5SQRL3548A4fMydoABy//ucNxN0CZRZOxQOX03AiaMFKS+8ClPrXbXuPaUd7SNsFPwfrkF+JG5f+ik3VQ9dfTsBvvTFaosDsoR+nPX1EGT7AIFsEiWASLEBAsgjXs8a8AAwBZnxYQS3wEOgAAAABJRU5ErkJggg==" />');
			});
			it('should inline svg sources that contain an "inline" attribute', function () {
				var test = '<img inline src="foo.svg" />';
				var html = inlineSync(test, { compress: false });
				html.should.eql('<svg x=\"0\" y=\"0\" viewbox=\"0 0 100 100\">\n<circle cx=\"50\" cy=\"50\" r=\"25\"/>\n</svg>');
			});
			it('should inline svg sources that contain an "inline" attribute, preserving other attributes', function () {
				var test = '<img id="foo" class="foo bar" inline src="foo.svg" />';
				var html = inlineSync(test, { compress: false });
				html.should.eql('<svg id=\"foo\" class=\"foo bar\" x=\"0\" y=\"0\" viewbox=\"0 0 100 100\">\n<circle cx=\"50\" cy=\"50\" r=\"25\"/>\n</svg>');
			});
			it('should inline compressed svg sources with options.compressed="true"', function () {
				var test = '<img inline src="foo.svg" />';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<svg x=\"0\" y=\"0\" viewbox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"25\"/></svg>');
			});
			it('should inline svg sources as base64 if options.svgAsImage="true"', function () {
				var test = '<img inline src="foo.svg" />';
				var html = inlineSync(test, { svgAsImage: true, compress: true });
				html.should.eql('<img src=\"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2225%22%2F%3E%3C%2Fsvg%3E\" />');
			});
			it('should inline svg sources as base64 if svgAsImage="true"', function () {
				var test = '<img inline inline-svgAsImage src="foo.svg" />';
				var html = inlineSync(test, { compress: true });
				html.should.eql('<img src=\"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2225%22%2F%3E%3C%2Fsvg%3E\" />');
			});
		});
	});

	describe('<custom>', function () {
		describe('async', function () {
			it('should ignore tag types with no handler', function (done) {
				var test = '<foo inline></foo>';
				inline(test, function (err, html) {
					should.not.exist(err);
					html.should.eql(test);
					done();
				});
			});
			it('should inline sources for custom tags and custom handler', function (done) {
				var test = '<foo inline></foo>';
				inline(test, {handlers: function (source, context, next) {
					if (source.tag == 'foo') source.content = 'foo';
					next();
				}}, function (err, html) {
					should.not.exist(err);
					html.should.eql('<foo>foo</foo>');
					done();
				});
			});
			it('should inline sources with overridden js handler', function (done) {
				var test = '<script src="foo.js" inline></script>';
				inline(test, {handlers: function (source, context, next) {
					if (source.type == 'js') source.content = 'foo';
					next();
				}}, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script>foo</script>');
					done();
				});
			});
			it('should inline sources with custom handler and special props', function (done) {
				var test = '<script type="application/json" src="foo.json" inline inline-var="window.foo"></script>';
				inline(test, { handlers: function (source, context, next) {
					if (source.type == 'json') source.content = source.props.var + ' = ' + source.fileContent;
					next();
				} }, function (err, html) {
					should.not.exist(err);
					html.should.eql('<script type="application/json">window.foo = {\n  "foo": "foo"\n}</script>');
					done();
				});
			});
		});

		describe('sync', function () {
			it('should ignore tag types with no handler', function () {
				var test = '<foo inline></foo>';
				var html = inlineSync(test);
				html.should.eql(test);
			});
			it('should inline sources for custom tags and custom handler', function () {
				var test = '<foo inline></foo>';
				var html = inlineSync(test, {handlers: function (source, context) {
					if (source.tag == 'foo') source.content = 'foo';
				} });
				html.should.eql('<foo>foo</foo>');
			});
			it('should inline sources with overridden js handler', function () {
				var test = '<script src="foo.js" inline></script>';
				var html = inlineSync(test, {handlers: function (source, context) {
					if (source.type == 'js') source.content = 'foo';
				} });
				html.should.eql('<script>foo</script>');
			});
			it('should inline sources with custom handler and special props', function () {
				var test = '<script type="application/json" src="foo.json" inline inline-var="window.foo"></script>';
				var html = inlineSync(test, { handlers: function (source, context) {
					if (source.type == 'json') source.content = source.props.var + ' = ' + source.fileContent;
				} });
				html.should.eql('<script type="application/json">window.foo = {\n  "foo": "foo"\n}</script>');
			});
		});
	});
});