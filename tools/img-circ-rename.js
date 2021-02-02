const { join } = require('path');
const { renameSync } = require('fs');
const glob = require('glob');

const SOURCES = ['../dist/circletextures-64', '../dist/circletextures-128', '../dist/circletextures-256']

const proc = (dir) => {

	console.log(dir);

	let files = glob.sync('**/*.png', {
		cwd: dir
	})

	console.log(files.length, dir);

	files.map( (f,i) => {

		const id  = f.split(' ')[0]
		const ext = f.split('.').pop()
		const name = `${id}.${ext}`


		const s = join(dir, f);
		const d = join(dir, name)

		// console.log(i, id, ext, s, d);

		renameSync(s, d);

	})

}

SOURCES.map( proc )