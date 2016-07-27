const pkg = require('../../../package')

module.exports = (name, ichVersion) => `{
  "name": "${name}",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "start": "./index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
      "ichabod-cli": "^${pkg.version}",
      "ichabod-core": "^${ichVersion}"
  }
}
`
