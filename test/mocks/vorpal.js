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

		prompt(opts) {
			if (verbose) console.log(opts)
			return Promise.resolve(nextPromptResults.shift())
		}
	}
}
