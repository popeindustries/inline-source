[![NPM Version](https://img.shields.io/npm/v/inline-source.svg?style=flat)](https://npmjs.org/package/inline-source)
[![Build Status](https://img.shields.io/travis/popeindustries/inline-source.svg?style=flat)](https://travis-ci.org/popeindustries/inline-source)

# inline-source

Inline and compress tags that contain the `inline` attribute. Supports `<script>`, `<link>`, and `<img>` (including `*.svg` sources) tags by default, and is easily extensible to handle others.

## Usage

**inline(htmlpath, [options], callback(err, html))**: asynchronously parse `htmlpath` content for tags containing an `inline` attribute, and replace with (optionally compressed) file contents.

`htmlpath` can be either a filepath *or* a string of html content.

Available `options` include:
- `attribute`: attribute used to parse sources (default `inline`)
- `compress`: enable/disable compression of inlined content (default `true`)
- `handlers`: specify custom handlers (default `[]`) [see [custom handlers](#custom-handlers)]
- `ignore`: disable inlining based on `tag`, `type`, and/or `format` (default `[]`)
- `pretty`: maintain leading whitespace when `options.compress` is `false` (default `false`)
- `rootpath`: directory path used for resolving inlineable paths (default `process.cwd()`)
- `swallowErrors`: enable/disable suppression of errors (default `false`)
- `svgAsImage`: convert `<img inline src="*.svg" />` to `<img>` and not `<svg>` (default `false`)

```bash
$ npm install inline-source
```
```html
<!-- located at project/src/html/index.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- inline project/www/css/inlineStyle.css as <style> -->
  <link inline href="css/inlineStyle.css">
  <!-- inline project/src/js/inlineScript.js as <script> -->
  <script inline src="../js/inlineScript.js"></script>
  <!-- inline project/www/images/inlineImage.png as base64 <img> -->
  <img inline src="images/inlineImage.png" />
  <!-- inline project/www/images/inlineImage.svg as <svg> -->
  <img inline src="images/inlineImage.svg" />
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
  rootpath: path.resolve('www'),
  // Skip all css types and png formats
  ignore: ['css', 'png']
}, function (err, html) {
  // Do something with html
});
```

**inline.sync(htmlpath, [options])**: same as `inline`, but synchronously returns string of html content.

```javascript
var inline = require('inline-source').sync
  , fs = require('fs')
  , path = require('path')
  , htmlpath = path.resolve('project/src/html/index.html');

var html = inline(htmlpath, {
  compress: true,
  rootpath: path.resolve('www'),
  // Skip all script tags
  ignore: 'script'
});
```

### Custom Handlers

Custom handlers are simple middleware-type functions that enable you to provide new, or override existing, inlining behaviour. All handlers have the following signature: `function handler (source, context, next) {}`

- `source`: the current source object to act upon
  - `attributes`: the parsed tag attributes object
  - `compress`: the compress flag (may be overriden at the tag level via [props](#props))
  - `content`: the processed `fileContent` string
  - `extension`: the file extension
  - `fileContent`: the loaded file content string
  - `filepath`: the fully qualified path string
  - `format`: the format string (`jpg`, `gif`, `svg+xml`, etc)
  - `match`: the matched html tag string, including closing tag if appropriate
  - `props`: the parsed namespaced attributes object (see [props](#props))
  - `replace`: the tag wrapped `content` string to replace `match`
  - `tag`: the tag string (`script`, `link`, etc)
  - `type`: the content type based on `type` mime-type attribute, or `tag` (`js` for `application/javascript`, `css` for `text/css`, etc)

- `context`: the global context object storing all configuration options (`attribute`, `compress`, `ignore`, `pretty`, `rootpath`, `swallowErrors`, `svgAsImage`), in addtion to:
  - `html`: the html file's content string
  - `htmlpath`: the html file's path string
  - `sources`: the array of `source` objects

- `next(err)`: a function to be called to advance to the next middleware function. Accepts an optional `error` object with behaviour determined by `swallowErrors` flag (stops all processing if `false`, skips current `source` if `true`)

Custom handlers are inserted before the defaults, enabling overriding of default behaviour:

```js
module.exports = function customjs (source, context, next) {
  if (source.fileContent
    && !source.content
    && (source.type == 'js')) {
      source.content = "Hey! I'm overriding the file's content!";
      next();
  } else {
    next();
  }
};
```

In general, default file content processing will be skipped if `source.content` is already set, and default wrapping of processed content will be skipped if `source.replace` is already set.

### Props

Source `props` are a subset of `attributes` that are namespaced with the current global `attribute` ('inline' by default), and allow declaratively passing data or settings to handlers:

```html
<script inline inline-foo="foo" inline-compress src="../js/inlineScript.js"></script>
```
```js
module.exports = function customjs (source, context, next) {
  if (source.fileContent
    && !source.content
    && (source.type == 'js')) {
      // The `inline-compress` attribute automatically overrides the global flag
      if (source.compress) {
        // compress content
      }
      if (source.props.foo == 'foo') {
        // foo content
      }
      next();
  } else {
    next();
  }
};
```