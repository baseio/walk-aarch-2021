const { join } = require('path');
const { renameSync } = require('fs');
const glob = require('glob');

const SOURCE = '../process/in/210108-karen+anne/AFGANG E20 rettede billeder OK/'
const DEST   = '../dist/project-images-2/'

// let files = glob.sync('**/*.{jpg,png,jpeg,gif}', {
let files = glob.sync('**/*.jpg', {
	cwd: SOURCE
})

console.log(files.length, files);

files.map( (f,i) => {

	const img = f.split('/')[1]
	const id  = img.split(' ')[0]
	const ext = img.split('.').pop()
	const name = `${id}.${ext}`


	const s = join(SOURCE, f);
	const d = join(DEST, name)

	console.log(i, id, ext, s, d);

	renameSync(s, d);

})