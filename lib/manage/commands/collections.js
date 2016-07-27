'use strict'

module.exports = ichabod => function(args) {
	Object.keys(ichabod.collections).forEach(coll => {
		this.log(coll)
	})

	return Promise.resolve()
}
