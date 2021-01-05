const { join } = require('path');
const { renameSync } = require('fs');
const glob = require('glob');

const SOURCE = '../process/in/201229-casper/ok-optim/'
const DEST   = '../dist/project-images/'

let files = glob.sync('**/*.{jpg,png,jpeg,gif}', {
	cwd: '../process/in/201229-casper/ok-optim/'
})

console.log(files.length, files);

files.map( (f,i) => {

	const id = f.split(' ')[0]
	const ext = f.split('.').pop()
	const name = `${id}.${ext}`


	const s = join(SOURCE, f);
	const d = join(DEST, name)

	console.log(i, id, ext, s, d);

	renameSync(s, d);

})