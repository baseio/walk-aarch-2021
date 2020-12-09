
import * as DATA from '../data.js'
import {action} from './actions.js'

import './styles.sidebar.css'

const FEATS = [
	{id:'about', name:'ABOUT'},
	// {id:'credits', name:'CREDITS'},
	// {id:'live', name:'LIVE'},
	// {id:'archive', name:'ARCHIVE'},
	// {id:'videos', name:'VIDEOS'},
	// {id:'script', name:'SCRIPT'},
	{id:'students', name:'GRADUATES'}
]

const state = {}
const themes = DATA.THEMES_EN;

export const initSidebar = (selector) => {

	
	
	state.selectedFeatIds = []
	state.selectedThemeIds = []
	state.selectedStudioIds = [] // not used - yet
	
	state.themes = []
	state.studios = []

	let _seen_themes = []
	let _seen_studios = []
	DATA.DATA_STUDENTS.forEach( s => {
		// console.log(s.theme, s.theme.length);
		if( s.theme.length > 0 ){ 
			if( !_seen_themes.includes(s.theme) ){
				_seen_themes.push( s.theme )
				const name = getThemeById(s.theme).replace(' (', '<br />(')
				state.themes.push({key:s.theme, value:name})
			}
			if( !_seen_studios.includes(s.studio) ){
				_seen_studios.push( s.studio )
				state.studios.push({key:s.studio, value:'X-'+s.studio})
			}
		}
	})
	// console.log(state);

	document.querySelector('#feats-menu').innerHTML = render_feats_menu()
	document.querySelector('#themes-menu').innerHTML = render_themes_menu()
	
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



	document.querySelector('#sidebar').style.display = 'block'


	document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
		// console.log('found', el.getAttribute('data-key'));
		el.addEventListener('click', (evnt) => {
			const el = evnt.target
			const trigger = el.getAttribute('data-trigger')
			const key = el.getAttribute('data-key')

			// const MODE = 'checkbox'
			const MODE = 'radio'

			const LIST = trigger === 'filter:feat' ? 'selectedFeatIds' : 'selectedThemeIds';

			// console.log('--- clicked', trigger, key, state[LIST] );
			///

			if( MODE === 'radio' ){
				// radio bhv
				state[LIST] = []
				const elms = document.querySelectorAll(`#sidebar [data-trigger="${trigger}"]`)

				let prevSelected

				// deselect all
				elms.forEach(elm => {
					if( elm.classList.contains('selected') ){
						elm.classList.remove('selected')
						prevSelected = elm.getAttribute('data-key')
						action(trigger, 'hide', elm.getAttribute('data-key'))
					}
				})

				// console.log('--- clicked2 toggleOff?', prevSelected, key );

				if( prevSelected != key ){
					// console.log('--- clicked3 toggle ON', key );

					el.classList.add('selected')
					action(trigger, 'show', key)

				}else{
					// console.log('--- clicked3 toggle OFF', key );

				}

				// enter/exit grid 
				setTimeout( () => {
					const any = document.querySelectorAll('#sidebar [data-trigger="filter:theme"].selected')
					// console.log('ANY', any, any.length);
					if( any.length === 0 ){
						window.toFree()
					}else{
						window.toGrid()
					}
				}, 100)

			}

			if( MODE === 'checkbox' ){
				// checkbox bhv
				if( state[LIST].includes(key) ){
					state[LIST] = state[LIST].filter(o => o != key)
					el.classList.remove('selected')
					// console.log('hide', key );
					action(trigger, 'hide', key)
				}else{
					state[LIST].push( key )
					el.classList.add('selected')
					// console.log('show', key );	
					action(trigger, 'show', key)
				}
			}
			
			// console.log(`state[${LIST}]:`, state[LIST]);

		})
	})

}

// const action = (trigger, action, id) => {
// 	console.log('action():', trigger, action, id)
// }


const render_feats_menu = () => {
	let html = ''
	// html = '<div class="section">FEATURES</div>'
	FEATS.forEach(s => {
		const selected = state.selectedFeatIds.includes(s.id)
		html += _partial_radiobtn('filter:feat', s.id, s.name, selected)
	})

	return html
}

const render_themes_menu = () => {
	let html = ''
	// html = '<div class="section">THEMES</div>'
	state.themes.forEach(s => {
		const selected = state.selectedThemeIds.includes(s.key)
		html += _partial_radiobtn('filter:theme', s.key, s.value, selected, '.twoline')
	})

	return html
}

const _partial_radiobtn = (trigger, key, val, selected=false, style='') => {
	return `
		<div class="toggle ${style} ${selected ? 'selected' : ''}" data-trigger="${trigger}" data-key="${key}">
			<span class="circle"> <span class="label">${val}</span> </span>
			
		</div>`
}

const getThemeById = (id) => {
	return themes.filter( t => t.id === id)[0]?.name || ''
}
