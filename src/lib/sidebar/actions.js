
import * as DATA from '../data.js'

let container
let _filterThemeTimeout = null
let themeFilter = null
let studentSelected = null

export const action = (trigger, action, id, args=[]) => {
	console.log('action():', trigger, action, id)
	container = document.querySelector('#content')

	if( trigger === 'filter:feat' ){
		if( action === 'hide'){
			container.innerHTML = ''
			return
		}
		if( action === 'show'){
			if( id === 'about' ) render_text(id)
			if( id === 'live' ) render_live(id)
			if( id === 'videos' ) render_videos(id)
			if( id === 'students' ) render_students(id)			
		}
	}


	if( trigger === 'filter:theme' ){
		if( action === 'hide' ){
			// _filterThemeTimeout = setTimeout( () => {
				render_theme(false)
			// }, 1)
		}

		if( action === 'show' ){
			// clearTimeout( _filterThemeTimeout )
			render_theme(id)
		}
	}

}

export const setStudentSelected = (s) => {
	studentSelected = s ? s : null
}

///

const render_theme = (val) => {
	themeFilter = val
	window.app.animation.applyFilter('theme', val)

	let studentsToggleSelected = document.querySelector('#sidebar [data-key="students"]').classList.contains("selected")
	console.log('studentsToggleSelected', studentsToggleSelected);
	if( studentsToggleSelected ){
		render_students()
	}
}


const render_text = (id) => {
	container.innerHTML = 'render_text:'+ id
}

const render_live = (id) => {
	container.classList = id
	container.innerHTML = `<iframe
    src="https://player.twitch.tv/?channel=jorgenskogmo&parent=vibrant-nobel-c7d9ea.netlify.app"
    height="600"
    width="800"
    frameborder="yes"
    scrolling="auto"
    allowfullscreen="true">`
}

const render_videos = (id) => {
	container.classList = id
	container.innerHTML = 'render_videos'
}

export const render_students = (id) => {
	console.log('render_students', id, studentSelected);
	container.classList = id

	let html = ''
	DATA.DATA_STUDENTS.forEach( s => {

		if( themeFilter ){
			if( s.theme === themeFilter ){
				if( studentSelected && s.stub === studentSelected.stub) {
					html += `<a class="student selectedHilite" href="/#${s.stub}">${s.name}</a><br />`
				}else{
					html += `<a class="student" href="/#${s.stub}">${s.name}</a><br />`
				}
			}
		
		}else{
			html += `<a class="student" href="/#${s.stub}">${s.name}</a><br />`
		}
	})
	container.innerHTML = html
}



// test
window.isLive = () => {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://api.twitch.tv/helix/streams", true);
	xhr.setRequestHeader("Client-ID", "My client id");
	var data = JSON.parse(xhr.responseText);
}