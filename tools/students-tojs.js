
const org_fn = 'Afgang Efteråret 2020_inkl forsinkede.xlsx'
const csv_fn = 'AAA-21.csv'

const fs = require('fs')
const parse = require('csv-parse')
const sourcefile = fs.readFileSync(csv_fn);

const headers = ['Studio','Navn','TEMA','Mail','Sprog_Projekt','Titel','Kommentarer']

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
	data.push({
    	'id': record['Mail'].split('@')[0],
    	'studio': record['Studio'].replace('Studio', '').trim(),
    	'name': record['Navn'],
    	'theme': record['TEMA'],
    	'title': record['Titel'],
    	'stub': getstub(record['Navn'])
    })
  }
 }).on('end', () => {


 		let version = (new Date()).toDateString()
 		
 		let str = `
const DATA_ORIGIN   = "${org_fn}"
const DATA_PARSEDAT = "${version}"
const DATA_STUDENTS = ${ JSON.stringify(data, null, '  ')}
`
 		// console.log('data', str)
		
		fs.writeFileSync(`./AAA-21.js`, str)

 })


