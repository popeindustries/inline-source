[![NPM Version](https://img.shields.io/npm/v/inline-source.svg?style=flat)](https://npmjs.org/package/inline-source)
[![Build Status](https://img.shields.io/travis/popeindustries/inline-source.svg?style=flat)](https://travis-ci.org/popeindustries/inline-source)

# inline-source

Inline and compress all `<script>` or `<link>` tags that contain the `inline` attribute.

**Note:** Resources are loaded *synchronously*, so these operations are best done during a build or template precompile step, and not per server request.

## Usage

**inline(htmlpath, [html], [options])**: synchronously parse `html` content for `<script>` and `<link>` tags containing an `inline` attribute, and replace with (optionally compressed) file contents.

If `html` content is omitted, content will be loaded from `htmlpath`.

Available `options` include:
- `compress`: enable/disable compression of inlined content (default `true`)
- `swallowErrors`: enable/disable suppression of errors (default `true`)
- `rootpath`: directory path used for resolving absolute inlineable paths (default `process.cwd()`)
- `attribute`: attribute used to parse sources (default `inline`)
- `inlineJS`: enable/disable inlining of `<script>` tags (default `true`)
- `inlineCSS`: enable/disable inlining of `<link>` tags (default `true`)
- `pretty`: maintain leading whitespace when `options.compress` is `false` (default `false`)

**NOTE:** If an error is encoutered when inlining a tag, the `inline` attribute will be removed and the remaining tag contents will be left untouched *unless* `options.swallowErrors = false` (in which case an `Error` will be thrown).

```bash
$ npm install inline-source
```
```html
<!-- located at project/src/html/index.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- inline project/src/js/inlineScript.js -->
  <script inline src="../js/inlineScript.js"></script>
  <!-- inline project/www/js/inlineScript.js -->
  <script inline src="/js/inlineScript.js"></script>
  <!-- inline project/src/css/inlineStyle.css -->
  <link inline rel="../css/inlineStyle.css"></link>
</head>
</html>
```
```javascript
var inline = require('inline-source')
  , fs = require('fs')
  , path = require('path')
  , htmlpath = path.resolve('project/src/html/index.html');

var html = inline(htmlpath, {
  compress: true,
  swallowErrors: false,
  rootpath: path.resolve('www')
});
```