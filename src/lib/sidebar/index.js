import {THEMES} from '../../app/data.js'

import './styles.sidebar.css'


const FEATS = [
	{id:'about', name:'ABOUT'},
	// {id:'credits', name:'CREDITS'},
	// {id:'live', name:'LIVE'},
	// {id:'archive', name:'ARCHIVE'},
	// {id:'videos', name:'VIDEOS'},
	// {id:'script', name:'SCRIPT'},
	{id:'graduates', name:'GRADUATES'}
]

let hideMenu = null
let lastMouseX = window.innerWidth

export const init = () => {

	// populate pages menu
	let html = ''
	FEATS.forEach( t => {
		html += `
			<div class="toggle" data-trigger="feat" data-key="${t.id}">
				<div class="circle"></div>
				<div class="label">${t.name}</div>
			</div>`
	})
	document.querySelector('#feats-menu').innerHTML = html


	// populate themes menu
	html = ''
	html = '<div class="section-header">7 Subjects:</div>'
	THEMES.forEach( t => {
		html += `
			<div class="toggle" data-trigger="theme" data-key="${t.slug}">
				<div class="circle"></div>
				<div class="label">#${t.name}</div>
			</div>`
	})
	document.querySelector('#themes-menu').innerHTML = html
	
	// add actions
	document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
		el.addEventListener('click', (evnt) => {
			const trigger = evnt.target.getAttribute('data-trigger')
			const key 	  = evnt.target.getAttribute('data-key')
			const hash    = trigger === 'theme' ? `#theme:${key}` : `#${key}`

			if( window.location.hash === hash ){
				// unselect
				window.location.hash = ''
			}else{
				// select
				window.location.hash = hash
			}
		})
	})

	// add show|hide action
	document.querySelector('#showhide').addEventListener('click', () => {
		const sb = document.querySelector('#sidebar')
		if( sb.classList.contains('closed') ){
			sb.classList.remove('closed')
			document.querySelector('#showhide').innerHTML = '-'
		}else{
			sb.classList.add('closed')
			document.querySelector('#showhide').innerHTML = '+'
		}
	})

	// show sidebar
	document.querySelector('#sidebar').style.display = 'block'

	document.addEventListener("mousemove", (evnt) => {
		clearTimeout( hideMenu )


		lastMouseX = evnt.screenX

		document.querySelector('#sidebar').classList.remove('fadedOut')
		hideMenu = setTimeout( () => {
			if( window.app.userDrawPlaying ) return
			if( window.app.animation.getMode() != 'free' ) return
			if( lastMouseX > document.querySelector('#sidebar').getBoundingClientRect().x ) return

			document.querySelector('#sidebar').classList.add('fadedOut')
		}, 2000 )
	})
}

