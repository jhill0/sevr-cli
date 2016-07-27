module.exports =
`const Ichabod = require('ichabod-core')
const cli     = require('ichabod-cli')

const ichabod = new Ichabod()

ichabod.attach(cli)

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
