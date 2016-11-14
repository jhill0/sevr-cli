/*eslint-env node, mocha */
'use strict'

const chai     = require('chai')
const mock     = require('mock-fs')
const fs       = require('fs')
const stdMocks = require('std-mocks')
const coll     = require('../lib/coll')

const expect = chai.expect

describe('sevr-coll <name>', function() {
	beforeEach(function() {
		mock()
	})

	afterEach(function() {
		mock.restore()
	})

	it('should reject if no name provided', function() {
		return coll()
			.then(() => { return Promise.reject() })
			.catch(err => {
				expect(err).to.eql('Collection name is required')
			})
	})

	it('should create the `collections` dir if not present', function() {
		return coll(['test-coll'])
			.then(() => {
				const stats = fs.statSync(process.cwd() + '/collections')
				expect(stats.isDirectory()).to.be.true
			})
	})

	it('should reject if `collections` exists but is not a dir', function() {
		mock({
			'collections': ''
		})
		return coll(['test-coll'])
			.then(() => {
				return Promise.rej()
			})
			.catch(err => {
				expect(err).to.eql('collections exists, but is not a directory')
			})
	})

	it('should create a new collection def in the `collections` dir', function() {
		mock({
			'collections': {}
		})
		return coll(['test-coll'])
			.then(() => {
				const stats = fs.statSync(process.cwd() + '/collections/test-coll.js')
				expect(stats.isFile()).to.be.true
			})
	})

	it('should ask to overwrite file if already exists', function(done) {
		mock({
			'collections': { 'test-coll.js': '' }
		})
		stdMocks.use({ print: true })

		coll(['test-coll'])
		setTimeout(() => {
			stdMocks.restore()
			const output = stdMocks.flush().stdout

			expect(output[1]).to.match(/Overwrite test-coll\.js/)
			done()
		}, 10)
	})

	it('should generate the singular property', function() {
		const tests = [
			{
				coll: 'users',
				singular: 'User'
			},
			{
				coll: 'people',
				singular: 'Person'
			}
		]

		return Promise.resolve()
			.then(() => {
				const test = tests[0]
				return coll([test.coll])
					.then(() => {
						const filePath = `${process.cwd()}/collections/${test.coll}.js`
						const contents = fs.readFileSync(filePath, { encoding: 'utf8' })
						return expect(contents).to.match(new RegExp(`singular: '${test.singular}'`))
					})
			})
			.then(() => {
				const test = tests[1]
				return coll([test.coll])
					.then(() => {
						const filePath = `${process.cwd()}/collections/${test.coll}.js`
						const contents = fs.readFileSync(filePath, { encoding: 'utf8' })
						return expect(contents).to.match(new RegExp(`singular: '${test.singular}'`))
					})
			})
	})
})
