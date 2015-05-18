# Changelog

**4.0.0** - May 18, 2015
* simplify `ignore` option to accept string or array of tags/types/format
* add support for inlining images (base64) and svg (inline `<svg>` or base64 via `options.svgAsImage`)

**3.0.0** - May 17, 2015
* add sync api
* update uglify-js dependency

**2.1.0** - May 2, 2015
* allow tags in conditional comments to be parsed
* update lodash dependency

**2.0.1** - Apr 24, 2015
* update lodash and uglify-js dependencies

**2.0.0** - Apr 24, 2015
* add support for custom handlers
* add support for `props` and declaratively passing data to custom handlers
* replace `inline*` options with `ignore` to specify by `tag` or `type`
* change api to remove optional `html` argument
* change api to be asynchronous, accepting a passed callback
* complete rewrite

**1.3.0** - Feb 13, 2015
* don't remote `inline` attribute when `options.inlineXXX` is `false`

**1.2.0** - Feb 5, 2015
* add support for pretty printing source contents with `options.pretty`
* add support for disabling js or css with `options.inlineJS` and `options.inlineCSS`