module.exports = data =>
`module.exports = Types => ({
	name: '${data.name}',
	type: Types.${data.type}
})
`
