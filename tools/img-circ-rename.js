const { join } = require('path');
const { renameSync } = require('fs');
const glob = require('glob');

const SOURCE = '../dist/circletextures'

let files = glob.sync('**/*.png', {
	cwd: SOURCE
})

console.log(files.length, files);

files.map( (f,i) => {

	const id  = f.split(' ')[0]
	const ext = f.split('.').pop()
	const name = `${id}.${ext}`


	const s = join(SOURCE, f);
	const d = join(SOURCE, name)

	console.log(i, id, ext, s, d);

	renameSync(s, d);

})