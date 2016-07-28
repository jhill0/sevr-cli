'use strict'

const util  = require('util')
const chalk = require('chalk')

module.exports = ichabod => function(args) {
	return new Promise((res, rej) => {
		const coll = ichabod.collections[args.collection]

		if (!coll) {
			return rej(`Could not find collection ${args.collection}`)
		}

		const displayField = coll.defaultField

		let query = {}

		if (args.query) {
			const pairs = args.query.split('&')
			pairs.forEach(pair => {
				const parts = pair.split('=').map(part => { return part.trim() })
				query[parts[0]] = parts[1]
			})
		}

		coll
			.read(query, null, true)
			.then(docs => {
				if (!docs.length) {
					this.log('No documents found')
					return res()
				}

				this.prompt({
					type: 'list',
					name: 'document',
					message: `Found ${docs.length} documents:`,
					choices: docs.map((doc, i) => {
						return {
							name: doc[displayField],
							value: i
						}
					})
				}, result => {
					const doc = docs[result.document].toObject()
					const filledDoc = fillPopulated(doc, coll.getFields())

					this.log(getDocumentOutput(filledDoc, coll.getFields()))
					res()
				})
			})
			.catch(err => {
				this.log(err)
				rej(err)
			})
	})
}

/**
 * Replace populated fields with only the default field value
 * @param  {Object} doc
 * @param  {Object} fields
 * @return {Object}
 */
const fillPopulated = function(doc, fields) {
	return Object.keys(fields).reduce((prev, key) => {
		let val

		if (fields[key].hasOwnProperty('referenceCollection')) {
			const displayField = fields[key].referenceCollection.defaultField

			if (Array.isArray(doc[key])) {
				val = doc[key].map(data => {
					return data[displayField]
				})
			} else {
				val = doc[key][displayField]
			}
		} else {
			val = doc[key]
		}
		return Object.assign({}, prev, {
			[key]: val
		})
	}, { _id: doc._id })
}

/**
 * Get the string representation of the document
 * @param  {Object} doc
 * @param  {Object} def
 * @param  {String} [labelTemplate='%s']
 * @return {String}
 */
const getDocumentOutput = function(doc, def, labelTemplate) {
	return Object.keys(doc)
		.map(key => {
			const field = doc[key]
			const fieldDef = def[key]

			if (!field || (!fieldDef && key != '_id')) {
				return null
			}

			const name = key == '_id' ? 'id' : fieldDef.label
			const template = labelTemplate || '%s'
			const label = util.format(template, name)

			if (typeof field == 'object' && !Array.isArray(field) && key != '_id') {
				return getDocumentOutput(field, fieldDef.schemaType, label + ' (%s)')
			}

			return `${chalk.yellow(label)}: ${field}`

		})
		.filter(line => { return line !== null })
		.join('\n')
}
