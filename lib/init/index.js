'use strict'

const fs              = require('fs')
const path            = require('path')
const utils           = require('../utils')
const constants       = require('../constants')
const indexTemplate   = require('./templates/index.tmpl')
const packageTemplate = require('./templates/package.tmpl')

const directories = [
	constants.DIRECTORY_NAMES.collections,
	constants.DIRECTORY_NAMES.types,
	constants.DIRECTORY_NAMES.config
]

module.exports = function(args) {
	const name = Array.isArray(args) ? args[0] : path.basename(process.cwd())

	return writeIndex()
		.then(() => {
			return writePackageJson(name)
		})
		.then(() => {
			return createDirs()
		})
		.then(() => { return name })
}

const writeIndex = function() {
	const filePath = `${process.cwd()}/index.js`

	return utils.createOrPromptOverwrite(filePath, indexTemplate)
}

const writePackageJson = function(name) {
	const filePath = `${process.cwd()}/package.json`

	return utils.createOrPromptOverwrite(
		filePath,
		packageTemplate(name, constants.CORE_VERSION)
	)
}

const createDirs = function() {
	const promises = directories.map(dir => new Promise((res, rej) => {
		const filePath = `${process.cwd()}/${dir}`

		fs.stat(filePath, (err, stats) => {
			if (err || !stats.isDirectory()) {
				fs.mkdir(filePath, (err) => {
					if (err) return rej(err)
					res()
				})
			} else {
				res()
			}
		})

	}))

	return Promise.all(promises)
}
