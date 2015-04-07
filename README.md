[![NPM Version](https://img.shields.io/npm/v/inline-source.svg?style=flat)](https://npmjs.org/package/inline-source)
[![Build Status](https://img.shields.io/travis/popeindustries/inline-source.svg?style=flat)](https://travis-ci.org/popeindustries/inline-source)

# inline-source

Inline and compress all tags (`<script>`, `<link>`, or anything other tag you'd like) that contain the `inline` attribute.

## 1.x to 2.x migration

## Usage

**inline(htmlpath, [options], callback(err, html))**: asynchronously parse `htmlpath` content for tags containing an `inline` attribute, and replace with (optionally compressed) file contents.

`htmlpath` can be either a filepath *or* a string of html content.

Available `options` include:
- `attribute`: attribute used to parse sources (default `inline`)
- `compress`: enable/disable compression of inlined content (default `true`)
- `handlers`: specify custom handlers (default `[]`) [see [custom handlers](#custom-handlers)]
- `ignore`: disable inlining based on `tag` and/or `type` (default `{ tag: [], type: [] }`)
- `pretty`: maintain leading whitespace when `options.compress` is `false` (default `false`)
- `rootpath`: directory path used for resolving inlineable paths (default `process.cwd()`)
- `swallowErrors`: enable/disable suppression of errors (default `false`)

```bash
$ npm install inline-source
```
```html
<!-- located at project/src/html/index.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- inline project/www/css/inlineStyle.css -->
  <link inline href="css/inlineStyle.css">
  <!-- inline project/src/js/inlineScript.js -->
  <script inline src="../src/js/inlineScript.js"></script>
</head>
</html>
```
```javascript
var inline = require('inline-source')
  , fs = require('fs')
  , path = require('path')
  , htmlpath = path.resolve('project/src/html/index.html');

inline(htmlpath, {
  compress: true,
  rootpath: path.resolve('www')
}, function (err, html) {
  // Do something with html
});
```

### Custom Handlers

### Props

## Examples