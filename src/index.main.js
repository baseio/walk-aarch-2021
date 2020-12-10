import {settings} from './settings.js'
import {initHashRouter, route} from './lib/router.js'

import * as Actions from './lib/sidebar/actions.js'
import * as Animation from './lib/anim/index.js'
import {initSidebar} from './lib/sidebar/index.js'
import {initSearch} from './lib/search/index.js'

import './styles.main.css'

document.title = settings.document_title
document.querySelector('#logo').innerHTML = settings.title


window.app = {
	sidebar: initSidebar('#sidebar-menu'),
	animation: Animation,
	search: initSearch('#search'),
	actions: Actions,
}

Animation.initAnimation('#animation')

initHashRouter( route )
