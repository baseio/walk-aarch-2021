const fs = require('fs')

const bitmap = fs.readFileSync('../dist/title.png')
const b64s = new Buffer(bitmap).toString('base64')

console.log(b64s);
