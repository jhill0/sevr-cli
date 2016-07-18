'use strict'

const fs           = require('fs')
const path         = require('path')
const inflection   = require('inflection')
const utils        = require('../utils')
const constants    = require('../constants')
const collTemplate = require('./templates/collection.tmpl')

module.exports = function(args) {
	const name = Array.isArray(args) ? args[0] : null
	const collDir = constants.DIRECTORY_NAMES.collections
	const collectionsPath = `${process.cwd()}/${collDir}`

	if (!name) {
		return Promise.reject('Collection name is required')
	}

	const singular = inflection.camelize(inflection.singularize(name.replace(/-/g, '_')))

	return createDir(collectionsPath)
		.then(() => {
			return createDefinition(`${collectionsPath}/${name}.js`, collTemplate({ singular }))
		})
		.then(() => {
			return name
		})
}

const createDir = function(dirPath) {
	return new Promise((res, rej) => {
		fs.stat(dirPath, (err, stats) => {
			if (err) return res(true)
			if (stats.isDirectory()) {
				res(false)
			} else {
				rej(`${path.basename(dirPath)} exists, but is not a directory`)
			}
		})
	})
	.then(create => {
		if (create) {
			return new Promise((res, rej) => {
				fs.mkdir(dirPath, err => {
					if (err) return rej(`Failed to create ${path.basename(dirPath)} directory`)
					return res()
				})
			})
		} else {
			return Promise.resolve()
		}
	})
}

const createDefinition = function(filePath, tmpl) {
	return utils.createOrPromptOverwrite(filePath, tmpl)
}
