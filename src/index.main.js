// console.log('index.main.js');

import {injectCSS, initHashRouter} from './lib/utils.js'
import {settings} from './settings.js'
import * as DATA from './lib/data.js'

import {initAnimation} from './lib/anim/index.js'
import {initSidebar} from './lib/sidebar/index.js'
import {initSearch} from './lib/search/index.js'

import './styles.main.css'


/// called by utils.hashRouter when the (window)-location changes (and on page load)
const OnHashChanged = (hash) => {
	console.log('OnHashChanged', hash, studentFromHash(hash) );
}

/// return student (if any) given a (location)-hash
const studentFromHash = (hash) => {
	return DATA.DATA_STUDENTS.filter(s => s.stub === hash)[0] || false
}

let _animation;
let _sidebar;
let _search;

const init = () => {

	document.title = settings.document_title

	initHashRouter( OnHashChanged )

	_sidebar   	= initSidebar('#sidebar-menu') // must be called before initAnimation, as the #userdraw element must be present...
	_animation	= initAnimation('#animation')
	_search 	= initSearch('#search')


	document.querySelector('#overlay').innerHTML = `
		<h1 class="title">${settings.title}</h1>
		<div id="content"></div>
	`
	
	// let html = ''
	// DATA.DATA_STUDENTS.forEach( s => {
	// 	html += `<a class="student" href="/#${s.stub}">${s.name}</a>`
	// })
	// document.querySelector('#content').innerHTML = html
}



init()