
import * as DATA from '../data.js'

import './styles.sidebar.css'
import './styles.pages.css'

const FEATS = [
	{id:'about', name:'ABOUT'},
	// {id:'credits', name:'CREDITS'},
	{id:'live', name:'LIVE'},
	// {id:'archive', name:'ARCHIVE'},
	{id:'videos', name:'VIDEOS'},
	// {id:'script', name:'SCRIPT'},
	{id:'graduates', name:'GRADUATES'}
]

const state = {}
const themes = DATA.THEMES_EN;


export const init = () => {

	// populate pages menu
	let html = ''
	FEATS.forEach( t => {
		html += `
			<div class="toggle twoline" data-trigger="feat" data-key="${t.id}">
				<span class="circle"> <span class="label">${t.name}</span> </span>
			</div>`
	})
	document.querySelector('#feats-menu').innerHTML = html


	// populate themes menu
	html = ''
	DATA.THEMES.forEach( t => {
		html += `
			<div class="toggle twoline" data-trigger="theme" data-key="${t.slug}">
				<span class="circle"> <span class="label">${t.name}</span> </span>
			</div>`
	})
	document.querySelector('#themes-menu').innerHTML = html
	
	// add actions to the menues
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
			console.log('show sidebar +');
		}else{
			sb.classList.add('closed')
			document.querySelector('#showhide').innerHTML = '+'
			console.log('hide sidebar');
		}
	})

	// show sidebar
	document.querySelector('#sidebar').style.display = 'block'
}

