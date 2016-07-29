/*eslint-env node, mocha */
'use strict'

const chai        = require('chai')
const spies       = require('chai-spies')
const VorpalMock  = require('../../mocks/vorpal')
const IchabodMock = require('../../mocks/ichabod')
const Create      = require('../../../lib/manage/commands/create')

const expect = chai.expect

chai.use(spies)

describe('create', function() {
	it('should return a promise', function() {
		const ichabod = new IchabodMock({
			coll1: {},
			coll2: {},
			coll3: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Create(ichabod).bind(vorpal)

		expect(cmd()).to.be.instanceof(Promise)
	})

	it('should reject if collection not found', function(done) {
		const ichabod = new IchabodMock({
			coll1: {}
		})
		const vorpal = new VorpalMock()
		const cmd = Create(ichabod).bind(vorpal)
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

	it('should prompt for each of the document fields', function(done) {
		const ichabod = new IchabodMock({
			coll1: {
				fields: {
					title: { label: 'Title', type: String, name: 'title' },
					body: { label: 'Body', type: String, name: 'body' }
				},
				defaultField: 'title'
			}
		}, {})
		const vorpal = new VorpalMock()
		const cmd = Create(ichabod).bind(vorpal)
		const args = {
			collection: 'coll1',
			options: {}
		}

		ichabod.collections['coll1'].setFieldTypes({
			title: ['title', 'String'],
			body: ['body', 'String']
		})

		chai.spy.on(vorpal, 'prompt')

		cmd(args)
		setTimeout(() => {
			expect(vorpal.prompt).to.have.been.called.with([
				{
					type: 'input',
					name: 'title',
					message: 'Title: '
				},
				{
					type: 'input',
					name: 'body',
					message: 'Body: '
				}
			])
			done()
		}, 10)
	})

	it('should create a new document with the provied values', function(done) {
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
		const cmd = Create(ichabod).bind(vorpal)
		const args = {
			collection: 'coll1',
			options: {}
		}
		const coll = ichabod.collections['coll1']

		coll.setFieldTypes({
			title: ['title', 'String'],
			body: ['body', 'String']
		})

		vorpal.setNextPromptResults({ title: 'test3', body: 'test body3' })

		chai.spy.on(coll, 'create')

		cmd(args)
		setTimeout(() => {
			expect(coll.create).to.have.been.called.with({
				title: 'test3',
				body: 'test body3'
			})
			done()
		}, 10)
	})
})