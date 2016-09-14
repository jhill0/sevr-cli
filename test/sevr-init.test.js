/*eslint-env node, mocha */
'use strict'

const chai     = require('chai')
const mock     = require('mock-fs')
const fs       = require('fs')
const stdMocks = require('std-mocks')
const init     = require('../lib/init')

const expect = chai.expect

describe('ich-init [name]', function() {
	beforeEach(function() {
		mock()
	})

	afterEach(function() {
		mock.restore()
	})

	it('should resolve with the project name', function() {
		return init(['cli-test'])
			.then(name => {
				expect(name).to.equal('cli-test')
			})
	})

	it('should create an `index.js` file in the project root', function() {
		return init(['cli-test'])
			.then(() => {
				const stats = fs.statSync(process.cwd() + '/index.js')
				expect(stats.isFile()).to.be.true
			})
	})

	it('should ask to overwrite `index.js` if already exists', function(done) {
		mock({ 'index.js': '' })
		stdMocks.use({ print: true })

		init(['cli-test'])
		setTimeout(() => {
			stdMocks.restore()
			const output = stdMocks.flush().stdout

			expect(output[1]).to.match(/Overwrite index\.js/)
			done()
		}, 10)
	})

	it('should create the project directories', function() {
		return init({ name: 'cli-test'})
			.then(() => {
				const dirs = ['collections', 'types', 'config']
				dirs.forEach(dir => {
					const stats = fs.statSync(process.cwd() + '/' + dir)
					expect(stats.isDirectory()).to.be.true
				})
			})
	})

	it('should not overwrite project directories that already exists', function() {
		mock({
			'collections': {
				'test.js': ''
			}
		})

		return init(['cli-test'])
			.then(() => {
				const dirs = ['collections', 'types', 'config']
				dirs.forEach(dir => {
					const stats = fs.statSync(process.cwd() + '/' + dir)
					expect(stats.isDirectory()).to.be.true
				})

				const stats = fs.statSync(process.cwd() + '/collections/test.js')
				expect(stats.isFile()).to.be.true
			})
	})

	it('should add a `package.json`', function() {
		return init(['cli-test'])
			.then(() => {
				const stats = fs.statSync(process.cwd() + '/package.json')
				expect(stats.isFile()).to.be.true
			})
	})

	it('should ask to overwrite `package.json` if already exists', function(done) {
		mock({ 'package.json': '' })
		stdMocks.use({ print: true })

		init(['cli-test'])
		setTimeout(() => {
			stdMocks.restore()
			const output = stdMocks.flush().stdout

			expect(output[1]).to.match(/Overwrite package\.json/)
			done()
		}, 10)
	})

	it('should use the directory name as the project name if name is not provided', function() {
		mock({
			'cli-no-name': {}
		})
		process.chdir('cli-no-name')

		return init()
			.then(() => {
				const stats = fs.statSync(process.cwd() + '/package.json')
				const contents = fs.readFileSync(process.cwd() + '/package.json', { encoding: 'utf8' })

				expect(stats.isFile()).to.be.true
				expect(contents).to.match(/"name": "cli-no-name"/)
			})
	})
})
