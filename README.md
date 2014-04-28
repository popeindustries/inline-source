[![Build Status](https://travis-ci.org/popeindustries/inline-source.png)](https://travis-ci.org/popeindustries/inline-source)

# inline-source

Inline and compress all `<script>` or `<link>` tags that contain the `inline` attribute.

## Usage

**NOTE:** If an error is encoutered when inlining a tag, the `inline` attribute will be removed and the remaining tag contents will be left untouched.

```html
<!-- project/src/html/index.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- inline project/src/js/inlineScript.js -->
  <script inline src="../js/inlineScript.js"></script>
  <!-- inline project/scripts/inlineScript.js -->
  <script inline src="/scripts/inlineScript.js"></script>
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
  , html = fs.readFileSync(htmlpath, 'utf8');

html = inline(htmlpath, html, {compress: true});
```