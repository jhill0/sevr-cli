module.exports =
`const Sevr = require('sevr')
const cli  = require('sevr-cli')

const sevr = new Sevr()

sevr.attach(cli)

sevr.connect()
	.then(() => {
		sevr.logger.verbose('Initialized database connection')
	})
	.catch(err => {
		sevr.logger.error(err)
	})

sevr.startServer()

module.exports = sevr
`
