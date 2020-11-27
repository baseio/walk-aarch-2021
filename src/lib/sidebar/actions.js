
import * as DATA from '../data.js'

let container

export const action = (trigger, action, id, args=[]) => {
	console.log('action():', trigger, action, id)
	container = document.querySelector('#content')

	if( trigger==='filter:feat' ){
		if( action==='hide'){
			container.innerHTML = ''
			return
		}
		if( action==='show'){
			if( id==='about' ) render_text(id)
			if( id==='live' ) render_live(id)
			if( id==='videos' ) render_videos(id)
			if( id==='students' ) render_students(id)			
		}
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

const render_students = (id) => {
	container.classList = id

	let html = ''
	DATA.DATA_STUDENTS.forEach( s => {
		html += `<a class="student" href="/#${s.stub}">${s.name}</a><br />`
	})
	container.innerHTML = html
}