/*eslint-env node, mocha */
'use strict'

const chai        = require('chai')
const spies       = require('chai-spies')
const VorpalMock  = require('../../mocks/vorpal')
const IchabodMock = require('../../mocks/ichabod')
const Collections = require('../../../lib/manage/commands/collections')

const expect = chai.expect

chai.use(spies)

describe('collections', function() {
	it('should return a promise', function() {
		const ichabod = new IchabodMock({
			coll1: {},
			coll2: {},
			coll3: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Collections(ichabod).bind(vorpal)

		expect(cmd()).to.be.instanceof(Promise)
	})

	it('should log all collections available for the ichabod instance', function() {
		const ichabod = new IchabodMock({
			coll1: {},
			coll2: {},
			coll3: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Collections(ichabod).bind(vorpal)

		const spy = chai.spy.on(vorpal, 'log')

		cmd()
		expect(spy).to.have.been.called(3)
		expect(vorpal.log).to.have.been.called.with('coll1')
		expect(vorpal.log).to.have.been.called.with('coll2')
		expect(vorpal.log).to.have.been.called.with('coll3')
	})
})
