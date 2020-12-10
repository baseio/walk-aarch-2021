import {settings} from './settings.js'
import {initHashRouter, route} from './lib/router.js'

import * as actions from './lib/actions.js'
import * as sidebar from './lib/sidebar/index.js'

// todo:
//import * as fx from 'lib/fx/W2021-PA/index.js'

import * as Animation from './lib/anim/index.js'
import {initSearch} from './lib/search/index.js'

import {action} from './lib/actions.js'

import './styles.main.css'

document.title = settings.document_title
document.querySelector('#logo').innerHTML = settings.title

window.app = {
	animation: Animation,
	search: initSearch('#search'),
	actions: actions,
}

sidebar.init()

Animation.initAnimation('#animation')

initHashRouter( route )
