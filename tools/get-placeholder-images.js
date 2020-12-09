const fs = require('fs');
const https = require('https');

const students = require('./data-bridge.js')


let index = 0

const next = async () => {
	if( index >= students.length ){
	// if( index >= 2 ){
		console.log('Done', index);
		return
	}
	const s = students[index]
	const studentName = s.stub
	const fileName = `${s.id}-${s.stub}.png`
	await saveImageToDisk( studentName, fileName)
	console.log(index, 'fetched', fileName);
	next()
}

const saveImageToDisk = async (studentName, fileName) => {
	return new Promise( (resolve, reject) => {
		
		const url  = `https://dummyimage.com/1920x1080/222/fff.png&text=${studentName}`;
		const path = `../dist/images/${fileName}` 
		
		const file = fs.createWriteStream(path);
		const request = https.get(url, (response) => {
			response.pipe(file);
			setTimeout( () => {
				index ++;
				resolve()
			}, 1000 )
		});
	});
}

next()