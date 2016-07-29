'use strict'

module.exports = function(verbose) {
	let nextPromptResults = []

	return {
		// Test Helpers ---------------------------
		setNextPromptResults(results) {
			nextPromptResults.push(results)
		},

		// Mocks ----------------------------------
		log(msg) {
			if (verbose) console.log(msg)
		},

		prompt(opts, cb) {
			if (verbose) console.log(opts)
			cb(nextPromptResults.shift())
		}
	}
}
