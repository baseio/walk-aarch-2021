const fs = require('fs')
const { join } = require('path');
const glob = require('glob')

const SOURCE = './paths/'
const DEST   = '../src/app/data/paths.js'

const files = glob.sync('**/*.svg', {
	cwd: SOURCE
})
//.slice(0, 1)

let result = {}

files.map( (f,i) => {
	const id = f.split('.')[0]

	const path = fs.readFileSync( join(SOURCE, f) )
		.toString()
		.split('<path')[1]
		.split('d="')[1]
		.split('"')[0]
		.trim()
		.replace(/\s\s+/g, ' ')

	console.log(id, path);
	result[ id ] = path
})

console.log(result);

fs.writeFileSync(DEST, 'export const PATHS = '+ JSON.stringify(result, null, '\t') )