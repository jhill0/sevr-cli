/*eslint-env node, mocha */
'use strict'

const chai        = require('chai')
const spies       = require('chai-spies')
const VorpalMock  = require('../../mocks/vorpal')
const IchabodMock = require('../../mocks/ichabod')
const Update      = require('../../../lib/manage/commands/update')

const expect = chai.expect

chai.use(spies)

describe('update', function() {
	it('should return a promise', function() {
		const ichabod = new IchabodMock({
			coll1: {},
			coll2: {},
			coll3: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Update(ichabod).bind(vorpal)

		expect(cmd()).to.be.instanceof(Promise)
	})

	it('should reject if collection not found', function(done) {
		const ichabod = new IchabodMock({
			coll1: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Update(ichabod).bind(vorpal)
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
		const ichabod = new IchabodMock({
			coll1: {}
		}, {})
		const vorpal = new VorpalMock()
		const cmd = Update(ichabod).bind(vorpal)
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
		const ichabod = new IchabodMock({
			coll1: {}
		}, {})
		const vorpal = new VorpalMock()
		const cmd = Update(ichabod).bind(vorpal)
		const coll = ichabod.collections['coll1']
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
		' the user to select a document', function(done) {
		const ichabod = new IchabodMock({
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
		const cmd = Update(ichabod).bind(vorpal)
		const args = {
			collection: 'coll1',
			options: {}
		}

		ichabod.collections['coll1'].setFieldTypes({
			title: ['title', 'String'],
			body: ['body', 'String']
		})

		vorpal.setNextPromptResults({ documentIndex: 0 })
		chai.spy.on(vorpal, 'prompt')

		cmd(args)
		setTimeout(() => {
			expect(vorpal.prompt).to.have.been.called.with({
				type: 'list',
				name: 'documentIndex',
				message: 'Select the document to update (2 found):',
				choices: [
					{ name: 'test1', value: 0 },
					{ name: 'test2', value: 1 }
				]
			})
			done()
		}, 10)
	})

	it('should prompt to update each of the document fields', function(done) {
		const ichabod = new IchabodMock({
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
		const cmd = Update(ichabod).bind(vorpal)
		const args = {
			collection: 'coll1',
			options: {}
		}

		ichabod.collections['coll1'].setFieldTypes({
			title: ['title', 'String'],
			body: ['body', 'String']
		})

		vorpal.setNextPromptResults({ documentIndex: 0 })
		chai.spy.on(vorpal, 'prompt')

		cmd(args)
		setTimeout(() => {
			expect(vorpal.prompt).to.have.been.called.with([
				{
					name: 'title',
					message: 'Title: ',
					default: ['test1'],
					type: 'input'
				},
				{
					name: 'body',
					message: 'Body: ',
					default: ['test body'],
					type: 'input'
				}
			])
			done()
		}, 10)
	})

	it('should update the document with the new values', function(done) {
		const ichabod = new IchabodMock({
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
		const cmd = Update(ichabod).bind(vorpal)
		const args = {
			collection: 'coll1',
			options: {}
		}
		const coll = ichabod.collections['coll1']

		coll.setFieldTypes({
			title: ['title', 'String'],
			body: ['body', 'String']
		})

		vorpal.setNextPromptResults({ documentIndex: 0 })
		vorpal.setNextPromptResults({ title: 'updatedTitle', body: 'updated body' })

		chai.spy.on(coll, 'updateById')

		cmd(args)
		setTimeout(() => {
			expect(coll.updateById).to.have.been.called.with({
				title: 'updatedTitle',
				body: 'updated body'
			}, 0)
			done()
		}, 10)
	})
})