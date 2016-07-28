'use strict'

const inflection = require('inflection')
const prompts    = require('../prompts')

module.exports = ichabod => function(args) {
	return new Promise((res, rej) => {
		const coll = ichabod.collections[args.collection]

		if (!coll) {
			return rej(`Could not find collection ${args.collection}`)
		}

		const displayField = coll.defaultField
		let query = {}

		// Parse the query string into an object that can be
		// understood by MongoDB
		if (args.query) {
			const pairs = args.query.split('&')
			pairs.forEach(pair => {
				const parts = pair.split('=').map(part => { return part.trim() })
				query[parts[0]] = parts[1]
			})
		}

		coll
			.read(query)
			.then(docs => {
				if (!docs.length) {
					this.log('No documents found')
					return
				}

				return prompts.confirmSelection(this, {
					message: `Select the document(s) to delete (${docs.length} found):`,
					choices: docs.map(doc => {
						return {
							name: doc[displayField],
							value: doc._id
						}
					})
				})
			})
			.then(documents => {
				const promises = []

				if (!documents) {
					return res()
				}

				// Delete each of the documents and push the resulting
				// promise to the promises array
				documents
					.forEach(doc => {
						promises.push(new Promise((res, rej) => {
							coll.delById(doc)
								.then(() => {
									res(doc)
								})
								.catch(err => { rej(err) })
						}))
					})

				return Promise.all(promises)
			})
			.then(documents => {
				const len = documents ? documents.length : 0
				this.log(`Deleted ${len} ${inflection.inflect('document', len)}`)
				res()
			})
			.catch(err => {
				this.log(err)
				rej(err)
			})
	})
}
