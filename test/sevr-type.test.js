/*eslint-env node, mocha */
'use strict'

const chai     = require('chai')
const mock     = require('mock-fs')
const fs       = require('fs')
const stdMocks = require('std-mocks')
const type     = require('../lib/type')

const expect = chai.expect

describe('sevr-type <name>', function() {
	beforeEach(function() {
		mock()
	})

	afterEach(function() {
		mock.restore()
	})

	it('should reject if no name provided', function() {
		return type()
			.then(() => { return Promise.reject() })
			.catch(err => {
				expect(err).to.eql('Type name is required')
			})
	})

	it('should create the `types` dir if not present', function() {
		return type(['test-type'])
			.then(() => {
				const stats = fs.statSync(process.cwd() + '/types')
				expect(stats.isDirectory()).to.be.true
			})
	})

	it('should reject if `types` exists but is not a dir', function() {
		mock({
			'types': ''
		})
		return type(['test-type'])
			.then(() => {
				return Promise.rej()
			})
			.catch(err => {
				expect(err).to.eql('types exists, but is not a directory')
			})
	})

	it('should create a new type def in the `types` dir', function() {
		mock({
			'types': {}
		})
		return type(['test-type'])
			.then(() => {
				const stats = fs.statSync(process.cwd() + '/types/test-type.js')
				expect(stats.isFile()).to.be.true
			})
	})

	it('should ask to overwrite file if already exists', function(done) {
		mock({
			'types': { 'test-type.js': '' }
		})
		stdMocks.use({ print: true })

		type(['test-type'])
		setTimeout(() => {
			stdMocks.restore()
			const output = stdMocks.flush().stdout

			expect(output[1]).to.match(/Overwrite test-type\.js/)
			done()
		}, 10)
	})

	it('should populate the type def name', function() {
		return type(['test-type'])
			.then(() => {
				const filePath = `${process.cwd()}/types/test-type.js`
				const contents = fs.readFileSync(filePath, { encoding: 'utf8' })
				return expect(contents).to.match(/name: 'test-type'/)
			})
	})

	it('should populate the type def type with provied type', function() {
		return type(['test-type'], { type: 'Boolean' })
			.then(() => {
				const filePath = `${process.cwd()}/types/test-type.js`
				const contents = fs.readFileSync(filePath, { encoding: 'utf8' })
				return expect(contents).to.match(/type: Types\.Boolean/)
			})
	})

	it('type def type should default to `String` if not provided', function() {
		return type(['test-type'])
			.then(() => {
				const filePath = `${process.cwd()}/types/test-type.js`
				const contents = fs.readFileSync(filePath, { encoding: 'utf8' })
				return expect(contents).to.match(/type: Types\.String/)
			})
	})
})
