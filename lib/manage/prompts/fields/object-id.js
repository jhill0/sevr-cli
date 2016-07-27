'use strict'

module.exports = (field, coll, refOptions) => {
	const options = refOptions.find(opt => {
		return opt.field === field.name
	}).options
	
	const displayField = Array.isArray(field.schemaType) ? field.schemaType[0].display : field.schemaType.display

	if (!options.length) {
		return null
	}

	return {
		type: Array.isArray(field.schemaType) ? 'checkbox' : 'list',
		choices: options.map(option => {
			return {
				name: option[displayField],
				value: option._id
			}
		})
	}
}
