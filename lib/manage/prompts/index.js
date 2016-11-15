'use strict'

const requireAll   = require('require-all')
const inflection   = require('inflection')
const fieldPrompts = requireAll(__dirname + '/fields')

/**
 * Return a field prompt determined by the field type
 * @param  {Object} collection
 * @param  {Object} field
 * @param  {Array}  refOptions
 * @param  {Object} [base]
 * @return {Object}
 */
exports.getFieldPrompts = (collection, field, refOptions, base) => {
	const types = collection.getFieldTypes(field.name).concat('default')
	const promptKey = types
		.map(type => {
			return inflection.underscore(type).replace(/_/g, '-')
		})
		.find(type => {
			return fieldPrompts.hasOwnProperty(type)
		})

	const prompt = fieldPrompts[promptKey](field, collection, refOptions)

	return Object.assign({}, base, prompt)
}

/**
 * Prompt for a selection and then prompt to confirm
 * @param  {Function} prompt
 * @param  {Object}   promptOpts
 * @return {Promise}
 */
exports.confirmSelection = (prompt, promptOpts) => {
	return new Promise(res => {

		const opts = Object.assign({}, {
			type: 'checkbox',
			name: 'items'
		}, promptOpts)

		prompt.prompt(opts)
			.then(selectionAnswer => {
				if (!selectionAnswer.items.length) return res()

				prompt.prompt({
					type: 'confirm',
					name: 'confirm',
					message: 'Are you sure: ',
					default: false
				})
				.then(confirmAnswer => {
					if (confirmAnswer.confirm) {
						res(selectionAnswer.items)
					} else {
						res()
					}
				})
			})
	})
}
