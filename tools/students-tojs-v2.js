
const org_fn = 'TEKSTER afgang-e20-2020-12-22.xlsx'
const csv_fn = 'AAA-21-v2.csv'

const fs = require('fs')
const parse = require('csv-parse')
const sourcefile = fs.readFileSync(csv_fn);

const headers = [
	'FirstName',
	'SurName',
	'Title',
	'Email',
	'Mibile',
	'Studio',
	'Text',
	'Alumni',
	'ID',
	'Entry Date'
	//'TEMA',
]

let data = []

const getstub = (name) => {
	return name
		.toLowerCase()
		.replace(/ /g, '-')
		.replace(/ô/g, 'o')
		.replace(/æ/g, 'ae')
		.replace(/ø/g, 'oe')
		.replace(/å/g, 'aa')	
}

  
parse(sourcefile, {
	columns: true,
	relax_column_count: true,
	trim: true,
	delimiter:',',
	columns: headers,
	from: 2,
}).on('readable', function(){
  
  let record
  while(record = this.read()){
    // console.log('record', record)
    const name = record['FirstName'] + ' ' + record['SurName']
	data.push({
    	'id': record['ID'],
    	'studio': record['Studio'].replace('Studio', '').trim(),
    	'name': name,
    	'theme': record['TEMA'],
    	'title': record['Title'],
    	'email': record['Email'],
    	'text': record['Text'].replace(/\s+\r\n/g, '<br /><br />'),
    	'stub': getstub(name)
    })
  }
 }).on('end', () => {


 		let version = (new Date()).toDateString()
 		
 		let str = `
export const DATA_ORIGIN   = "${org_fn}"
export const DATA_PARSEDATE = "${version}"
export const DATA_STUDENTS = ${ JSON.stringify(data, null, '  ')}
`
 		console.log('data', str)
		
		// fs.writeFileSync(`../src/lib/data/students.js`, str)

 })


