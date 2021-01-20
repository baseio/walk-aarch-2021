
import {settings} from './settings.js'
import * as DATA from './data.js'

import {render_hash} from './hash.js'


let container
let _filterThemeTimeout = null
let themeFilter = null
let studentSelected = null



export const setStudentSelected = (s) => {
	console.log('setStudentSelected', s);
	studentSelected = s ? s : null
}

///

export const clearFeatSelection = () => {
	console.log('@sidebar clearFeatSelection');
	Array.from( document.querySelectorAll(`#sidebar [data-trigger="filter:feat"]`)).forEach( el => {
		el.classList.remove('selected')
	})
}

export const clearThemeSelection = () => {
	console.log('@sidebar clearThemeSelection');
	Array.from( document.querySelectorAll(`#sidebar [data-trigger="filter:theme"]`)).forEach( el => {
		el.classList.remove('selected')
	})
}


///

export const render_theme = (val) => {
	console.log('render_theme:', val);
	// document.querySelector('#logo').innerHTML = settings.title + render_hash() + val.name.replace(/ /g, '&nbsp;')
	document.querySelector('#logo').innerHTML = settings.title + render_hash(val.name.replace(/ /g, '&nbsp;'))

	const studentsToggleSelected = document.querySelector(`#sidebar [data-trigger="feat"][data-key="graduates"]`).classList.contains("selected")
	// console.log('render_theme: studentsToggleSelected', studentsToggleSelected);
	if( !studentsToggleSelected ){
		document.querySelector('#overlay').style.pointerEvents = 'none'
	}

	// themeFilter = val
	
	// // if $graduates is selected, just filter the text-list
	// const studentsToggleSelected = document.querySelector(`#sidebar [data-trigger="feat"][data-key="graduates"]`).classList.contains("selected")
	// console.log('studentsToggleSelected', studentsToggleSelected);
	// if( studentsToggleSelected ){
	// 	studentSelected = false
	//  	render_students('graduates', val)
	// }else{

	// 	window.app.animation.applyFilter('theme', val.id)	

	// }

}

export const clear_theme = () => {
	document.querySelector('#logo').innerHTML = settings.title	
}

//

export const clear_content = () => {
	window.toFree()

	document.querySelector('#content').innerHTML = ''
	document.querySelector('#content').classList = 'hide'
	// document.querySelector('#content').style.overflowY = 'auto'
	document.querySelector('#curtain').classList = ''
	document.querySelector('#overlay').style.pointerEvents = 'none'
	window.app.pauseRendering = false
}


export const render_text = (id) => {
	console.log('render_text', id);
	container = document.querySelector('#content')
	if( id === 'about' ){
		container.innerHTML = `<div class="copytext">${DATA.DATA_ABOUT}</div>`
		container.classList = 'show'
		container.style.overflowY = 'auto'
		document.querySelector('#curtain').classList = 'black'
		document.querySelector('#overlay').style.pointerEvents = 'all'
		
		setTimeout( () => {
			window.app.pauseRendering = true
		}, 500)
	}
}


// pending client
// unfinnished
export const render_live = (id) => {
	container = document.querySelector('#content')
	container.classList = id
	container.innerHTML = `<iframe
    src="https://player.twitch.tv/?channel=jorgenskogmo&parent=vibrant-nobel-c7d9ea.netlify.app"
    height="600"
    width="800"
    frameborder="yes"
    scrolling="auto"
    allowfullscreen="true">`
}


// pending client
// unfinnished: needs test with multiple vimeo-thumbs and a layout
export const render_videos = (id) => {
	container = document.querySelector('#content')
	container.classList = id
	container.innerHTML = 'render_videos'
}


// called from clicking a ball
export const render_student = (stub) => {

	const s = DATA.DATA_STUDENTS.filter( student => student.stub === stub)[0]
	console.log('render_student', stub, s);

	document.querySelectorAll('#sidebar [data-trigger="theme"]').forEach( el => {
		el.classList.remove('selected')
	})
	// const btn = document.querySelector(`#sidebar [data-trigger="theme"][data-key="${theme.slug}"]`)
	// if( btn ){
	// 	btn.classList.add('selected')
	// }

	const html = `

		<div class="studentinfo">

			<div class="div1">

				<span class="name">${s.name}</span>
				
				<br /><br /><br />
				<br />
				<span class="theme">GRADUATION PROJECT:<br />
				${s.title}
				</span>

				<br />
				<br />
				<span class="studio">PROGRAMME:<br />
				STUDIO ${s.studio}
				</span>

				<br />
				<br />
				<span class="studio">CONTACT:<br />
				${s.email}<br />
				${s.mobile}
				</span>
			</div>

			<div class="div2">
				<a class="projectlink" style="text-align:center;" href="https://afgang.aarch.dk/2021/student/${s.stub}">SEE PROJECT</a>
			</div>
			
			<div class="div3">
				<div class="projectimage">
					<img alt="${s.title}" src="project-images/${s.id}.jpg" />
				</div>
			</div>

			<div class="div4">
				<!-- (pdf-link?) -->
			</div>

		</div>


	`

	content.classList = 'hide'
	document.querySelector('#curtain').classList = 'show'
	setTimeout( () => {
		content.innerHTML = html
		content.classList = 'show'
	}, 750);

	const theme = DATA.THEMES.filter(t => t.id === s.theme)[0]
	// document.querySelector('#logo').innerHTML = settings.title + render_hash() + theme.name.replace(/ /g, '&nbsp;')
	document.querySelector('#logo').innerHTML = settings.title + render_hash(theme.name.replace(/ /g, '&nbsp;'))
}
export const hide_render_student = () => {
	document.querySelector('#curtain').classList = 'hide'
	content.innerHTML = ''
}


export const render_students_filtered = (theme) => {
	console.log('render_students_filtered', theme);
	themeFilter = theme.id
	render_students('graduates')

	// document.querySelector('#logo').innerHTML = settings.title + render_hash() + theme.name.replace(/ /g, '&nbsp;')
	document.querySelector('#logo').innerHTML = settings.title + render_hash(theme.name.replace(/ /g, '&nbsp;'))

	// unselect all 
	document.querySelectorAll('#sidebar [data-trigger="theme"]').forEach( el => {
		el.classList.remove('selected')
	})

	// select
	const btn = document.querySelector(`#sidebar [data-trigger="theme"][data-key="${theme.slug}"]`)
	if( btn ){
		btn.classList.add('selected')
	}
}
export const clear_students_filter = () => {
	document.querySelector('#logo').innerHTML = settings.title
	document.querySelector('#overlay').style.pointerEvents = 'none'
	themeFilter = null
}

export const render_students = (id) => {
	console.log('render_students', id, studentSelected, themeFilter);
	container = document.querySelector('#content')
	container.classList = id

	document.querySelector('#overlay').style.pointerEvents = 'all'
	container.style.overflowY = 'auto'

	let html = ''

	html += '<div style="height:100%;"><div style="align-self: flex-end;">'

	DATA.DATA_STUDENTS.forEach( s => {

		// console.log(themeFilter, s.theme, s.theme === themeFilter );

		if( themeFilter ){
			if( s.theme === themeFilter ){
				if( studentSelected && s.stub === studentSelected.stub) {
					html += `<a class="student selectedHilite" href="/#&nbsp;${s.stub}">${s.name}</a>`
				}else{
					html += `<a class="student" href="/#${s.stub}">${s.name}</a>`
				}
			}
		
		}else{
			html += `<a class="student" href="/#${s.stub}">${s.name}</a>`
		}
	})

	html += '</div></div>'

	if( themeFilter ) console.log('studs, with themeFilter:', themeFilter, html);

	container.innerHTML = html

	// document.querySelector('#logo').innerHTML = settings.title + ':<br />@<span class="spacer-alpha">&nbsp;</span>All'
	document.querySelector('#logo').innerHTML = settings.title + ':<br />#<span class="spacer-hash">&nbsp;</span>GRADUATES'
}

