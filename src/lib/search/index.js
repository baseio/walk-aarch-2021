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

	window.app.animation.applyFilter('student', term)
	
	let html = ''

	html += '<div style="height:100%;"><div style="align-self: flex-end;">'

	DATA.DATA_STUDENTS.forEach( s => {

		if( s.name.indexOf( term ) > -1 ){

			// html += `<a class="student" href="/#${s.stub}">${s.name}</a>`
			
			//const re = new RegExp(`\\b${word}\\b`)//(,"b");

			// const re = new RegExp(`\\${term}\\gi`)
			const st = '/'+ term +'/gi'
			// console.log(st);


			const re = new RegExp(st)


			// let text = s.name.replace(re, (match) => {
			let text = s.name.replace(term, (match) => {
				// console.log('a', match);
				return '<span class="highlight">' + match + '</span>'
			})

			html += `<a class="student" href="/#${s.stub}">${text}</a>`
		}else{

			html += `<a class="student hide" href="/#${s.stub}">${s.name}</a>`

		}
	})

	html += '</div></div>'

	document.querySelector('#content').innerHTML = html


	document.querySelector('#overlay').style.pointerEvents = 'all'
	document.querySelector('#content').style.overflowY = 'auto'
	
}