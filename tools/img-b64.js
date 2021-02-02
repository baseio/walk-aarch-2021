const fs = require('fs')
const { join } = require('path');
const glob = require('glob')

const SOURCE = '../dist/circletextures-64/'
const DEST   = '../src/app/data/circletextures-b64.js'

const files = glob.sync('**/*.png', {
	cwd: SOURCE
})

let result = {}

files.map( (f,i) => {

	const id  = f.split('.')[0]
	const file = join(SOURCE, f);

	const bitmap = fs.readFileSync(file)
	// const b64s = file
	const b64s = new Buffer(bitmap).toString('base64')

	console.log(i, id, b64s.length);

	result[ id ] = b64s
})

fs.writeFileSync(DEST, 'export const CIRCLEIMAGESB64 = '+ JSON.stringify(result, null, '\t') )