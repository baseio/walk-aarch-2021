
const org_fn = 'afgang-e20-2021-01-19 AK _LISTE UDEN FORSINKEDE.xlsx + URL liste afgang.aarch.dk.xlsx'
const csv_fn = 'afgang-e20-2021-01-05.csv'

const fs = require('fs')
const parse = require('csv-parse')
const sourcefile = fs.readFileSync(csv_fn);

const headers = [
	'FirstName',
	'SurName',
	'Slug',
	'Theme',
	'Title',
	'Email',
	'Mobile',
	'Studio',
	'ID'
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
    let mobile = record['Mobile'] || ''
    mobile = mobile.replace(/ /g, '').trim()
    if ( mobile.length === 8 ){
    	mobile = `+45${mobile}`
    }else if( mobile.length === 10){
    	mobile = `+${mobile}`
    }
    // console.log(mobile, record['Mobile']);

    let slug = record['Slug'] // https://afgang.aarch.dk/2021/student/huiru-huang/ 
    slug = slug.replace('https://afgang.aarch.dk/2021/student/', '')
    slug = slug.replace('/', '')


	data.push({
    	'id': record['ID'],
    	'studio': record['Studio'].replace('Studio', '').trim(),
    	name,
    	'theme': record['Theme'],
    	'title': record['Title'],
    	'email': record['Email'],
    	mobile, 
    	// 'text': record['Text'].replace(/\s+\r\n/g, '<br /><br />'),
    	// 'stub': getstub(name),
    	'stub': slug //record['Slug'].replace('https://afgang.aarch.dk/', '/')
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
 		console.log('data', data.length)
		
		fs.writeFileSync(`../src/app/data/students.js`, str)

 })


