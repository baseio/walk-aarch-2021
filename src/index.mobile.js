console.log('index.mobile.js');

import {settings} from './settings.js'
import * as DATA from './lib/data.js'

import './styles.mobile.css'

const init = () => {
	
	document.title = settings.document_title

	let html = `<h1 class="title">${settings.title}</h1>`

	DATA.DATA_STUDENTS.forEach( s => {
		html += `<div class="student">${s.name}</div>`
	})

	document.querySelector('#overlay').innerHTML = html
}



init()