'use strict'

const fs           = require('fs')
const path         = require('path')
const utils        = require('../utils')
const constants    = require('../constants')
const typeTemplate = require('./templates/type.tmpl')

module.exports = function(args, options) {
	const name = Array.isArray(args) ? args[0] : null
	const typesDir = constants.DIRECTORY_NAMES.types
	const typesPath = `${process.cwd()}/${typesDir}`
	const type = options && options.type ? options.type : 'String'

	if (!name) {
		return Promise.reject('Type name is required')
	}

	return createDir(typesPath)
		.then(() => {
			return createDefinition(
				`${typesPath}/${name}.js`,
				typeTemplate({ name, type })
			)
		})
		.then(() => { return name })
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
