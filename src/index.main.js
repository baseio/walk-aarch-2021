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


const init = () => {

	document.title = settings.document_title
	document.querySelector('#logo').innerHTML = settings.title

	initHashRouter( OnHashChanged )

	window.app = {
		sidebar: initSidebar('#sidebar-menu'),
		animation: Animation,
		search: initSearch('#search'),
		actions: Actions,
	}

	Animation.initAnimation('#animation')

	
}

init()