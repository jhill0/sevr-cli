/*eslint-env node, mocha */
'use strict'

const chai       = require('chai')
const spies      = require('chai-spies')
const chalk      = require('chalk')
const VorpalMock = require('../../mocks/vorpal')
const SevrMock   = require('../../mocks/sevr')
const Find       = require('../../../lib/manage/commands/find')

const expect = chai.expect

chai.use(spies)

describe('find', function() {
	it('should return a promise', function() {
		const sevr = new SevrMock({
			coll1: {},
			coll2: {},
			coll3: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Find(sevr).bind(vorpal)

		expect(cmd()).to.be.instanceof(Promise)
	})

	it('should reject if collection not found', function(done) {
		const sevr = new SevrMock({
			coll1: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Find(sevr).bind(vorpal)
		const args = {
			collection: 'coll2'
		}

		cmd(args)
			.then(function() {
				done(new Error('Promised resolved. Expected rejection'))
			})
			.catch(err => {
				expect(err).to.eql('Could not find collection coll2')
				done()
			})
	})

	it('should log and exit if no documents found', function() {
		const sevr = new SevrMock({
			coll1: {}
		}, {})
		const vorpal = new VorpalMock()
		const cmd = Find(sevr).bind(vorpal)
		const args = {
			collection: 'coll1'
		}

		chai.spy.on(vorpal, 'log')

		return cmd(args)
			.then(() => {
				expect(vorpal.log).to.have.been.called.exactly.once
				expect(vorpal.log).to.have.been.called.with('No documents found')
			})
	})

	it('should convert a string-based query to an object that mongoose understands', function() {
		const sevr = new SevrMock({
			coll1: {}
		}, {})
		const vorpal = new VorpalMock()
		const cmd = Find(sevr).bind(vorpal)
		const coll = sevr.collections['coll1']
		const promises = []

		chai.spy.on(coll, 'read')

		promises.push(
			cmd({ collection: 'coll1', query: 'name=foo' })
			.then(() => {
				expect(coll.read).to.have.been.called.with({
					name: 'foo'
				})
			})
		)

		promises.push(
			cmd({ collection: 'coll1', query: 'name=foo&username=bar' })
			.then(() => {
				expect(coll.read).to.have.been.called.with({
					name: 'foo',
					username: 'bar'
				})
			})
		)

		return Promise.all(promises)
	})

	it('should display a prompt showing the number of found documents and ask' +
		' the user to select a document', function() {
		const sevr = new SevrMock({
			coll1: {
				fields: {
					title: { label: 'Title', type: String },
					body: { label: 'Body', type: String }
				},
				defaultField: 'title'
			}
		}, {
			coll1: [
				{ title: 'test1', body: 'test body' },
				{ title: 'test2', body: 'test body2' }
			]
		})

		const vorpal = new VorpalMock()
		const cmd = Find(sevr).bind(vorpal)
		const args = {
			collection: 'coll1'
		}

		vorpal.setNextPromptResults({ document: 0 })
		chai.spy.on(vorpal, 'prompt')

		return cmd(args)
			.then(() => {
				expect(vorpal.prompt).to.have.been.called.with({
					type: 'list',
					name: 'document',
					message: 'Found 2 documents:',
					choices: [
						{ name: 'test1', value: 0 },
						{ name: 'test2', value: 1 }
					]
				})
			})
	})

	it('should log each of the fields for the selected document', function() {
		const sevr = new SevrMock({
			coll1: {
				fields: {
					title: { label: 'Title', type: String },
					body: { label: 'Body', type: String }
				},
				defaultField: 'title'
			}
		}, {
			coll1: [
				{ title: 'test1', body: 'test body' },
				{ title: 'test2', body: 'test body2' }
			]
		})

		const vorpal = new VorpalMock()
		const cmd = Find(sevr).bind(vorpal)
		const args = {
			collection: 'coll1'
		}

		vorpal.setNextPromptResults({ document: 0 })
		chai.spy.on(vorpal, 'log')

		return cmd(args)
			.then(() => {
				expect(vorpal.log).to.have.been.called.with(
					`${chalk.yellow('Title')}: test1\n` +
					`${chalk.yellow('Body')}: test body`
				)
			})
	})
})
