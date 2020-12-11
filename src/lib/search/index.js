import * as DATA from '../../app/data.js'

import './styles.search.css'

let el;

export const initSearch = (selector) => {

	const default_value = 'SEARCH'

	document.querySelector(selector).innerHTML = `
		<input id="searchfield" name="Search" type="search" value="${default_value}" />
		<label for="searchfield" style="display:none;">search for a student</label>
	`
	el = document.querySelector('#searchfield')
	
	el.addEventListener('focus', () => {
		console.log('focus', el.value );
		if( el.value.trim() === default_value ){
			el.value = ''
		}
	})

	el.addEventListener('input', search)
	el.addEventListener('keydown', search)
	el.addEventListener('paste', search)
	el.addEventListener('submit', search)
}

const search = () => {

	const term = el.value//.toLowerCase()

	console.log('searching for', term);
	
	let html = ''
	DATA.DATA_STUDENTS.forEach( s => {

		if( s.name.indexOf( term ) > -1 ){

			// html += `<a class="student" href="/#${s.stub}">${s.name}</a>`
			
			//const re = new RegExp(`\\b${word}\\b`)//(,"b");

			// const re = new RegExp(`\\${term}\\gi`)
			const st = '/'+ term +'/gi'
			console.log(st);


			const re = new RegExp(st)


			// let text = s.name.replace(re, (match) => {
			let text = s.name.replace(term, (match) => {
				// console.log('a', match);
				return '<span class="highlight">' + match + '</span>'
			})

			// console.log('text', text, s.name);

			html += `<a class="student" href="/#${s.stub}">${text}</a><br />`

			

		}
	})
	document.querySelector('#content').innerHTML = html
	
}