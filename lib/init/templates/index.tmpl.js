module.exports =
`const Ichabod = require('ichabod-core')

const ichabod = new Ichabod()

ichabod.connect()
	.then(() => {
		ichabod.logger.verbose('Initialized database connection')
	})
	.catch(err => {
		ichabod.logger.error(err)
	})

ichabod.startServer()

module.exports = ichabod
`
