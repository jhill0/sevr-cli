module.exports = data =>
`module.exports = type => ({
	singular: '${data.singular}',
	fields: [],
	meta: {}
})
`
