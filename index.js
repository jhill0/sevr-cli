'use strict'

const _           = require('lodash')
const vantage     = require('vantage')()
const Find        = require('./lib/manage/commands/find')
const Collections = require('./lib/manage/commands/collections')
const Create      = require('./lib/manage/commands/create')
const Remove      = require('./lib/manage/commands/remove')
const Update      = require('./lib/manage/commands/update')
const remoteAuth  = require('./lib/remote-auth')

module.exports = (sevr, _config) => {
	const config = _.merge({}, {}, _config)

	sevr.events.on('db-ready', () => {

		// collections
		vantage
			.command('collections', 'List the available collections')
			.action(Collections(sevr))

		// find
		vantage
			.command('find <collection> [query]', 'Search for documents within a collection')
			.action(Find(sevr))

		// create
		vantage
			.command('create <collection>', 'Create a new document within a collection')
			.action(Create(sevr))

		// update
		vantage
			.command('update <collection> [query]', 'Update a document within a collection')
			.option('-s, --select [select]', 'Select fields (comma seperated)')
			.action(Update(sevr))

		// delete
		vantage
			.command('delete <collection> [query]', 'Delete documents within a collection')
			.action(Remove(sevr))


		vantage
			.auth(remoteAuth, {sevr})
			.delimiter('sevr-remote$')
			.listen(4000)
	})
}
