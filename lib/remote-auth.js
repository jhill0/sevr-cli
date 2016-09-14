'use stict'

module.exports = function(vantage, options) {
	const sevr = options.sevr

	return function(args, cb) {
		if (!sevr.authentication.isEnabled) {
			return cb('Authentication not enabled', true)
		}

		sevr.authentication.validateCredentials({
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
