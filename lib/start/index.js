'use strict'

const path     = require('path')
const inquirer = require('inquirer')
const Create   = require('../manage/commands/create')

const authMsg = 'It looks like you\'ve enabled authentication for the first time.\n' +
				'Please create a new user:'

class SevrStart {
	constructor(sevr, config) {
		this.sevr = sevr
		this.config = config

		sevr.authentication.events.on('auth-enabled', this._onAuthEnable.bind(this))
	}

	_onAuthEnable() {
		const auth = this.sevr.authentication
		
		if (auth.isFirstEnable) {
			// If this this the first time authentication has been enabled,
			// prompt the user to create a new user.
			this.sevr.logger.warning(authMsg)
			return doUserPrompt(this.sevr, auth.collection.name)
				.catch(err => {
					this.sevr.logger.error(err)
					process.exit()
				})
		}
	}

	didInitialize() {
		if (this.config.doReset) {
			this.sevr.logger.warning('Performing Sevr reset...')
			this.sevr.reset()
		}
	}
}


module.exports = function(args) {
	const pathToSevr = args.path ? path.resolve(args.path) : process.cwd()
	const sevr = require(pathToSevr)

	sevr.attach(SevrStart, { doReset: args.reset })

	sevr.start()
		.catch(err => { sevr.logger.error(err.stack) })
}

const doUserPrompt = (sevr, coll) => {
	const create = Create(sevr)

	return create.call(inquirer, { collection: coll })
		.then(() => {
			sevr.logger.info('User successfully created')
		})
}