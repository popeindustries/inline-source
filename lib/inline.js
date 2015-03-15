
/**
 * Inline 'sources' into 'html'
 * @param {Array} source
 * @param {String} html
 * @param {Object} context
 * @returns {String}
 */
module.exports = function inline (context) {
	var type, content;

	if (context.sources.length) {
		context.sources.forEach(function (source) {
			// if (source.inline) {
			// 	type = source.type;
			// 	try {
			// 		// Read from File instance if passed
			// 		// (popeindustries/buddy optimization)
			// 		content = source.instance
			// 			? source.instance.content
			// 			: fs.readFileSync(source.filepath, 'utf8');
			// 		// Compress if set
			// 		if (context.compress) content = utils.compressContent(type, content);
			// 		content = utils.wrapContent(type, content, {
			// 			padding: source.padding,
			// 			pretty: context.pretty
			// 		});
			// 	} catch (err) {
			// 		if (!context.swallowErrors) throw err;
			// 		// Remove 'inline' attribute if error loading content
			// 		content = source.match.replace(' ' + context.attribute, '');
			// 	}
			// // Disabled via context.inlineXX
			// } else {
			// 	content = source.match;
			// }

			// // Replace inlined content in html (PR #5)
			// html = html.replace(source.match, function () { return content; });
		});
	}

	return html;
}