'use strict';

/**
 * Process stack for 'sources'
 * @param {Object} context
 * @param {Array} sources
 * @param {Boolean} swallowErrors
 * @param {Function} [fn(err)]
 */
module.exports = function run (context, sources, swallowErrors, fn) {
	var errored = false
		, outstanding = sources.length;

	if (outstanding) {
		sources.forEach(function (source) {
			// Async
			if (fn) {
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

			// Sync
			} else {
				source.stack.forEach(function (handler) {
					if (!errored) {
						try {
							handler(source, context);
						} catch (err) {
							if (!swallowErrors) {
								errored = true;
								throw err;
							} else {
								// Clear content
								source.content = '';
								source.errored = true;
							}
						}
					}
				});
			}
		});

		// Done sync
		if (!fn) return context.html;

	// No sources
	} else {
		return fn
			? fn(null, context.html)
			: context.html;
	}
};