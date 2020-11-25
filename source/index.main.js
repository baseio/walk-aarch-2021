console.log('index.main.js');

import {injectCSS, initHashRouter} from './lib/utils.js'
import {settings} from '../settings.js'
import * as DATA from './lib/data.js'

import {initAnimation} from './lib/anim/index.js'
import {initSidebar} from './lib/sidebar/index.js'


/// called by utils.hashRouter when the (window)-location changes (and on page load)
const OnHashChanged = (hash) => {
	console.log('OnHashChanged', hash);
	console.log('OnHashChanged', studentFromHash(hash) );
}

/// return student (if any) given a (location)-hash
const studentFromHash = (hash) => {
	return DATA.DATA_STUDENTS.filter(s => s.stub === hash)[0] || false
}

let _animation;
let _sidebar;


const init = () => {

	
	document.title = settings.document_title

	initHashRouter( OnHashChanged )
	injectCSS('./styles.main.css')

	_sidebar   = initSidebar('#sidebar') // must be called before initAnimation, as the #userdraw element must be present...
	_animation = initAnimation('#animation')


	let html = `<h1 class="title">${settings.title}</h1>`

	DATA.DATA_STUDENTS.forEach( s => {
		html += `<a class="student" href="/#${s.stub}">${s.name}</a>`
	})

	document.querySelector('#overlay').innerHTML = html
}



init()