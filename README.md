[![Build Status](https://travis-ci.org/popeindustries/inline-source.png)](https://travis-ci.org/popeindustries/inline-source)

# inline-source

Inline and compress all `<script>` or `<link>` tags that contain the `inline` attribute.

## Usage

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
  <style inline href="../css/inlineStyle.css"></style>
</head>
</html>
```
```javascript
var inlineSource = require('inline-source')
  , fs = require('fs')
  , path = require('path')
  , htmlpath = path.resolve('project/src/html/index.html');
  , html = fs.readFileSync(htmlpath, 'utf8');

html = inlineSource(htmlpath, html);
```