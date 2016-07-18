'use strict'

const inquirer = require('inquirer')

exports.overwrite = (file) => {
	return inquirer.prompt({
		type: 'confirm',
		name: 'overwrite',
		message: `Overwrite ${file}: (y/N)`,
		default: false
	})
	.then(answers => { return answers.overwrite })
}
