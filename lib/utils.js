'use strict'

const fs              = require('fs')
const path            = require('path')
const overwritePrompt = require('./prompts').overwrite

exports.createOrPromptOverwrite = function(filePath, data) {
	return new Promise((res, rej) => {
		fs.stat(filePath, (err, stats) => {
			let exists = true
			if (err) exists = false

			if (exists && stats.isFile()) {
				overwritePrompt(path.basename(filePath))
					.then(overwrite => {
						if (overwrite) {
							fs.writeFile(filePath, data, err => {
								if (err) return rej(err)
								res()
							})
						} else {
							res()
						}
					})
			} else {
				fs.writeFile(filePath, data, err => {
					if (err) return rej(err)
					res()
				})
			}
		})
	})
}
