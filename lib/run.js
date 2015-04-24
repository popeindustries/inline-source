/**
 * Process stack for 'sources'
 * @param {Object} context
 * @param {Array} sources
 * @param {Boolean} swallowErrors
 * @param {Function} fn(err)
 */
module.exports = function run (context, sources, swallowErrors, fn) {
	var errored = false
		, outstanding = sources.length;

	if (outstanding) {
		sources.forEach(function (source) {
			var idx = 0
				, next = function (err) {
						if (err) {
							if (!swallowErrors) {
								errored = true;
								return fn(err);
							} else {
								// Clear content
								source.content = '';
								source.errored = true;
							}
						}

						if (!errored) {
							var handler = source.stack[idx++];

							if (handler) return handler(source, context, next);

							// Done
							if (!--outstanding) return fn(null, context.html);
						}
					};

			next();
		});
	} else {
		fn(null, context.html);
	}
}