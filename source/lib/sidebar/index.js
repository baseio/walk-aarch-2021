
import {injectCSS} from '../utils.js'
import * as DATA from '../data.js'

const state = {}

export const initSidebar = (selector) => {

	injectCSS('lib/sidebar/styles.sidebar.css')

	

	state.selectedThemeIds = []
	state.selectedStudioIds = []
	state.themes = []
	state.studios = []

	let _seen_themes = []
	let _seen_studios = []
	DATA.DATA_STUDENTS.forEach( s => {
		if( !_seen_themes.includes(s.theme) ){
			_seen_themes.push( s.theme )
			state.themes.push({key:s.theme, value:getThemeById(s.theme)})
		}
		if( !_seen_studios.includes(s.studio) ){
			_seen_studios.push( s.studio )
			state.studios.push({key:s.studio, value:'X-'+s.studio})
		}
	})
	// console.log(state);

	

	render(selector)

	

}

const render = (selector) => {
	let html = ''
	html += render_themes_menu()

	document.querySelector(selector).innerHTML = html

	document.querySelectorAll(selector +' [data-trigger]').forEach( el => {
		console.log('found', el.getAttribute('data-key'));
		el.addEventListener('click', (evnt) => {
			const el = evnt.target
			// console.log('clicked', el)
			const trigger = el.getAttribute('data-trigger')
			const key = el.getAttribute('data-key')
			console.log('clicked', trigger, key );

			if( trigger === 'filter:theme' ){
				if( state.selectedThemeIds.includes(key) ){
					state.selectedThemeIds = state.selectedThemeIds.filter(o => o != key)
				}else{
					state.selectedThemeIds.push( key )
				}
			}

			render(selector)
		})
	})
}

const render_themes_menu = () => {
	let html = ''
	state.themes.forEach(s => {
		const selected = state.selectedThemeIds.includes(s.key)
		html += _partial_radiobtn('filter:theme', s.key, s.value, selected)
	})

	return html
}

const _partial_radiobtn = (trigger, key, val, selected=false) => {
	return `
		<div class="toggle ${selected ? 'selected' : ''}" data-trigger="${trigger}" data-key="${key}">
			<span class="circle"></span>
			<span class="label">${val}</span>
		</div>`
}

const getThemeById = (id) => {
	return DATA.THEMES.filter( t => t.id === id)[0]?.name || false
}
