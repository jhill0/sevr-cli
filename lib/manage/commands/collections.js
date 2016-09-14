'use strict'

module.exports = sevr => function(args) {
	Object.keys(sevr.collections).forEach(coll => {
		this.log(coll)
	})

	return Promise.resolve()
}
