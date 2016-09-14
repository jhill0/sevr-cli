/*eslint-env node, mocha */
'use strict'

const chai       = require('chai')
const spies      = require('chai-spies')
const VorpalMock = require('../../mocks/vorpal')
const SevrMock   = require('../../mocks/sevr')
const Remove     = require('../../../lib/manage/commands/remove')

const expect = chai.expect

chai.use(spies)

describe('update', function() {
	it('should return a promise', function() {
		const sevr = new SevrMock({
			coll1: {},
			coll2: {},
			coll3: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Remove(sevr).bind(vorpal)

		expect(cmd()).to.be.instanceof(Promise)
	})

	it('should reject if collection not found', function(done) {
		const sevr = new SevrMock({
			coll1: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Remove(sevr).bind(vorpal)
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
		const cmd = Remove(sevr).bind(vorpal)
		const args = {
			collection: 'coll1',
			options: {}
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
		const cmd = Remove(sevr).bind(vorpal)
		const coll = sevr.collections['coll1']
		const promises = []

		chai.spy.on(coll, 'read')

		promises.push(
			cmd({ collection: 'coll1', options: {}, query: 'name=foo' })
			.then(() => {
				expect(coll.read).to.have.been.called.with({
					name: 'foo'
				})
			})
		)

		promises.push(
			cmd({ collection: 'coll1', options: {}, query: 'name=foo&username=bar' })
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
		' the user to select documents', function(done) {
		const sevr = new SevrMock({
			coll1: {
				fields: {
					title: { label: 'Title', type: String, name: 'title' },
					body: { label: 'Body', type: String, name: 'body' }
				},
				defaultField: 'title'
			}
		}, {
			coll1: [
				{ _id: 0, title: 'test1', body: 'test body' },
				{ _id: 1, title: 'test2', body: 'test body2' }
			]
		})

		const vorpal = new VorpalMock()
		const cmd = Remove(sevr).bind(vorpal)
		const args = {
			collection: 'coll1',
			options: {}
		}

		sevr.collections['coll1'].setFieldTypes({
			title: ['title', 'String'],
			body: ['body', 'String']
		})

		vorpal.setNextPromptResults({ documentIndex: 0 })
		chai.spy.on(vorpal, 'prompt')

		cmd(args)
		setTimeout(() => {
			expect(vorpal.prompt).to.have.been.called.with({
				type: 'checkbox',
				name: 'items',
				message: 'Select the document(s) to delete (2 found):',
				choices: [
					{ name: 'test1', value: 0 },
					{ name: 'test2', value: 1 }
				]
			})
			done()
		}, 10)
	})

	it('should delete a single selected document', function() {
		const sevr = new SevrMock({
			coll1: {
				fields: {
					title: { label: 'Title', type: String, name: 'title' },
					body: { label: 'Body', type: String, name: 'body' }
				},
				defaultField: 'title'
			}
		}, {
			coll1: [
				{ _id: 0, title: 'test1', body: 'test body' },
				{ _id: 1, title: 'test2', body: 'test body2' }
			]
		})

		const vorpal = new VorpalMock()
		const cmd = Remove(sevr).bind(vorpal)
		const args = {
			collection: 'coll1',
			options: {}
		}
		const coll = sevr.collections['coll1']

		coll.setFieldTypes({
			title: ['title', 'String'],
			body: ['body', 'String']
		})

		chai.spy.on(coll, 'delById')

		return Promise.resolve()
			.then(() => {
				vorpal.setNextPromptResults({ items: [0] })
				vorpal.setNextPromptResults({ confirm: true })

				return cmd(args)
			})
			.then(() => {
				return expect(coll.delById).to.have.been.called.with(0)
			})
			.then(() => {
				vorpal.setNextPromptResults({ items: [0, 1] })
				vorpal.setNextPromptResults({ confirm: true })

				return cmd(args)
			})
			.then(() => {
				expect(coll.delById).to.have.been.called.with(0)
				expect(coll.delById).to.have.been.called.with(1)
			})
	})
})
