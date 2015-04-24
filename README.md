[![NPM Version](https://img.shields.io/npm/v/inline-source.svg?style=flat)](https://npmjs.org/package/inline-source)
[![Build Status](https://img.shields.io/travis/popeindustries/inline-source.svg?style=flat)](https://travis-ci.org/popeindustries/inline-source)

# inline-source

Inline and compress all tags (`<script>`, `<link>`, or any other tag you'd like) that contain the `inline` attribute.

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
  <script inline src="../js/inlineScript.js"></script>
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

Custom handlers are simple middleware-type functions that enable you to provide new, or override existing, inlining behaviour. All handlers have the following signature: `function handler (source, context, next) {}`

- `source`: the current source object to act upon
  - `attributes`: the parsed tag attributes object
  - `compress`: the compress flag (may be overriden at the tag level via [props](#props))
  - `content`: the processed `fileContent` string
  - `fileContent`: the loaded file content string
  - `filepath`: the fully qualified path string
  - `match`: the matched html tag string, including closing tag if appropriate
  - `props`: the parsed namespaced attributes object (see [props](#props))
  - `replace`: the tag wrapped `content` string to replace `match`
  - `tag`: the tag string (`script`, `link`, etc)
  - `type`: the content type based on `type` mime-type attribute, or `tag` (`js` for `application/javascript`, `css` for `text/css`, etc)

- `context`: the global context object storing all configuration options (`attribute`, `compress`, `ignore`, `pretty`, `rootpath`, `swallowErrors`), in addtion to:
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