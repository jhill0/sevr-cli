'use strict'

module.exports = ichabod => ({
	collectionExists: args => {
		if (!ichabod.collections.hasOwnProperty(args.collection)) {
			return `Could not find collection ${args.collection}`
		}

		return true
	}
})
