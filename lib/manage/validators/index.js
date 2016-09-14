'use strict'

module.exports = sevr => ({
	collectionExists: args => {
		if (!sevr.collections.hasOwnProperty(args.collection)) {
			return `Could not find collection ${args.collection}`
		}

		return true
	}
})
