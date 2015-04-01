
/**
 *
 * @param {Object} context
 * @param {Function} fn(err)
 */
module.exports = function run (context, fn) {
	var errored = false
		, outstanding = 0;

	context.sources.forEach(function (source) {
		outstanding++;

		var idx = 0
			, next = function (err) {
					if (err) {
						errored = true;
						return fn(err);
					}

					if (!errored) {
						var handler = source.stack[id++];

						// Done
						if (!handler && !--outstanding) return fn();

						handler(source, next);
					}
				};

		next();
	});
}