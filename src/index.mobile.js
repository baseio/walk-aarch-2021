// console.log('index.mobile.js');

import {settings} from './app/settings.js'
import * as DATA from './app/data.js'

import './styles.mobile.css'

const init = () => {
	
	document.title = settings.document_title
	document.querySelector('#logo').innerHTML = settings.title //.replace(' ', '<br />')

	let html = ''

	DATA.DATA_STUDENTS.forEach( s => {
		html += `<a class="student pill">${s.name}</a>`
	})

	document.querySelector('#list').innerHTML = html

	document.querySelector('.studs-toggle').addEventListener("click", (e) => {
		e.target.classList.toggle('on')
		document.querySelector('#list').style.display = e.target.classList.contains('on')
			? 'block'
			: 'none'

		document.querySelector('#animation').style.display = e.target.classList.contains('on')
			? 'none'
			: 'block'
	})
}



init()