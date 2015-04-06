/**
 * Process stack for 'sources'
 * @param {Array} sources
 * @param {Function} fn(err)
 */
module.exports = function run (sources, fn) {
	var errored = false
		, outstanding = sources.length;

	if (outstanding) {
		sources.forEach(function (source) {
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