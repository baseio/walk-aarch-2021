const fs = require('fs');

const str = fs
	.readFileSync(`../src/lib/data/students.js`)
	.toString()
	.split('export const DATA_STUDENTS = ')[1]

const data = JSON.parse(str)

// console.log(data[0]);

module.exports = data
