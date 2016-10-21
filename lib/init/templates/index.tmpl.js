module.exports =
`const Sevr    = require('sevr')
const SevrCli = require('sevr-cli')

/**
 * Application plugin class
 * 
 * All custom application intialization and logic
 * should happen within this class
 * 
 * @class App
 */
class App {
	constructor(sevr) {
		this.sevr = sevr
	}

	run() {
		this.sevr.startServer()
		this.sevr.logger.verbose('Application running...')
	}
}

// Create a new Sevr instance
const sevr = new Sevr()

// Attach the remote CLI plugin
sevr.attach(SevrCli)

// Attach the application plugin
sevr.attach(App)

module.exports = sevr
`