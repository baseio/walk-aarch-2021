// console.log('index.main.js');

import {injectCSS, initHashRouter} from './lib/utils.js'
import {settings} from './settings.js'
import * as DATA from './lib/data.js'

import * as Animation from './lib/anim/index.js'
import {initSidebar} from './lib/sidebar/index.js'
import {initSearch} from './lib/search/index.js'

import * as Actions from './lib/sidebar/actions.js'

import './styles.main.css'


/// called by utils.hashRouter when the (window)-location changes (and on page load)
const OnHashChanged = (hash) => {
	console.log('OnHashChanged', hash, studentFromHash(hash) );
}

/// return student (if any) given a (location)-hash
const studentFromHash = (hash) => {
	return DATA.DATA_STUDENTS.filter(s => s.stub === hash)[0] || false
}

// let _animation;
// let _sidebar;
// let _search;

const init = () => {

	document.title = settings.document_title

	initHashRouter( OnHashChanged )


	// _sidebar   	= initSidebar('#sidebar-menu')
	// _search 	= initSearch('#search')

	window.app = {
		sidebar: initSidebar('#sidebar-menu'),
		animation: Animation,
		search: initSearch('#search'),
		actions: Actions,
	}

	Animation.initAnimation('#animation')


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