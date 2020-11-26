
import * as DATA from '../data.js'

import './styles.sidebar.css'

const FEATS = [
	{id:'about', name:'ABOUT'},
	{id:'credits', name:'CREDITS'},
	{id:'live', name:'LIVE'},
	// {id:'archive', name:'ARCHIVE'},
	{id:'videos', name:'VIDEOS'},
	// {id:'script', name:'SCRIPT'},
	{id:'students', name:'STUDENTS'}
]

const state = {}

export const initSidebar = (selector) => {

	
	
	state.selectedFeatIds = []
	state.selectedThemeIds = []
	state.selectedStudioIds = []
	
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

	

	// render(selector)

	document.querySelector('#feats-menu').innerHTML = render_feats_menu()
	document.querySelector('#themes-menu').innerHTML = render_themes_menu()

	document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
		// console.log('found', el.getAttribute('data-key'));
		el.addEventListener('click', (evnt) => {
			const el = evnt.target
			const trigger = el.getAttribute('data-trigger')
			const key = el.getAttribute('data-key')
			console.log('clicked', trigger, key );

			if( trigger === 'filter:feat' ){
				if( state.selectedFeatIds.includes(key) ){
					state.selectedFeatIds = state.selectedThemeIds.filter(o => o != key)
					el.classList.remove('selected')
				}else{
					state.selectedFeatIds.push( key )
					el.classList.add('selected')
				}
			}

			if( trigger === 'filter:theme' ){
				if( state.selectedThemeIds.includes(key) ){
					state.selectedThemeIds = state.selectedThemeIds.filter(o => o != key)
					el.classList.remove('selected')
				}else{
					state.selectedThemeIds.push( key )
					el.classList.add('selected')
				}
			}

		})
	})

}


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
	return DATA.THEMES.filter( t => t.id === id)[0]?.name || ''
}
