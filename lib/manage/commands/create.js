'use strict'

const prompts = require('../prompts')

module.exports = ichabod => function(args) {
	const coll = ichabod.collections[args.collection]

	if (!coll) {
		return rej(`Could not find collection ${args.collection}`)
	}

	const fields = coll.getFields(true)

	return coll.getRefOptions()
		.then(refOptions => {
			const fieldPrompts = Object.keys(fields).reduce((prev, key) => {
				return prev.concat(
					prompts.getFieldPrompts(coll, fields[key], refOptions, {
						name: key,
						message: `${fields[key].label}: `
					})
				)
			}, [])

			return new Promise((res, rej) => {
				this.prompt(fieldPrompts, results => {
					const doc = joinComplexData(results)
					coll.create(doc)
						.then(() => res())
						.catch(err => rej(err))
				})
			})
		})
}

const joinComplexData = function(data) {
	return Object.keys(data).reduce((map, key) => {
		if (key.indexOf('.') < 0) {
			map[key] = data[key]
		} else {
			const parts = key.split('.')
			const obj = Object.assign({}, map[parts[0]], {
				[parts[1]]: data[key]
			})
			map[parts[0]] = obj
		}

		return map
	}, {})
}
