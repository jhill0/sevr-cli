'use stict'

module.exports = function(vantage, options) {
	const ichabod = options.ichabod

	return function(args, cb) {
		if (!ichabod.authentication.isEnabled) {
			return cb('Authentication not enabled', true)
		}

		ichabod.authentication.validateCredentials({
				username: args.user,
				password: args.pass
			})
			.then(user => {
				const msg = `Logged in as ${user.username}.`

				this.log(msg)
				cb(msg, true)
			})
			.catch(err => {
				const msg = `Failed to log in as ${args.user}.`

				this.log(msg)
				cb(msg, false)
			})
	}
}
