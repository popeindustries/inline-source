
/**
 *
 * @param {Object} context
 * @param {Function} fn(err)
 */
module.exports = function run (context, fn) {
	var errored = false
		, outstanding = context.sources.length;

	if (outstanding) {
		context.sources.forEach(function (source) {
			var idx = 0
				, next = function (err) {
						if (err) {
							errored = true;
							return fn(err);
						}

						if (!errored) {
							var handler = source.stack[idx++];

							if (handler) return handler(source, next);

							// Done
							if (!--outstanding) return fn();
						}
					};

			next();
		});
	} else {
		fn();
	}
}