/*! 

 *******************************************************************************
 * Hi!                                                                         *
 * Drop js@dearstudio.dk an email if you want access to the un-minified source *
 * (CC BY-NC-SA 4.0)                                                           *
 *******************************************************************************
 
*/

import {settings} from './app/settings.js'

import * as actions from './app/actions.js'
import {handleHash} from './app/routes.js' 

import {Router} from './lib/router.js'

import * as sidebar from './lib/sidebar/index.js'

// todo:
//import * as fx from 'lib/fx/W2021-PA/index.js'

import * as Animation from './lib/anim/index.js'
import {initSearch} from './lib/search/index.js'

import './styles.main.css'
import './styles.pages.css'

document.title = settings.document_title
document.querySelector('#logo').innerHTML = settings.title

window.app = {}

window.app.animation = Animation
window.app.actions = actions
window.app.sidebar = sidebar.init()
window.app.search  = initSearch('#search')

Animation.initAnimation('#animation')

window.app.router = new Router(handleHash)

