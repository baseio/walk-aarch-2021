import * as DATA from './data.js'

export const route = (hash) => {
	console.log('Route:', hash)
	// console.log('OnHashChanged #2', app.balls);
	const b = window.app.balls.filter( b => b.el.userData.data.stub === hash )[0]
	// console.log('OnHashChanged #3', b);
	if( b ){
		// student
		const accepted = window.toNode( b.i )
		console.log('OnHashChanged #4 accepted', accepted);
		if( accepted ){
			const btn = document.querySelector(`#sidebar [data-trigger="filter:theme"][data-key="${b.el.userData.data.theme}"]`)
			if( btn ){
				btn.classList.add('selected')
			}
		}

	}else if( hash.indexOf('theme:') === 0 ){
		// theme
		hash = hash.split(':')[1]
		const slug  = hash.toLowerCase().replace(/ /g, '-')
		const theme = DATA.THEMES.filter(t => t.slug === slug )[0]

		console.log('OnHashChanged theme:', hash, slug, theme);

		// unselect all 
		document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
			el.classList.remove('selected')
		})

		// select
		const btn = document.querySelector(`#sidebar [data-trigger="theme"][data-key="${slug}"]`)
		if( btn ){
			btn.classList.add('selected')
		}
		// window.toFree()
		// Array.from( document.querySelectorAll(`#sidebar [data-trigger="filter:theme"]`)).forEach(el => {
		// 	el.classList.remove('selected')
		// })
		// const btn = document.querySelector(`#sidebar [data-trigger="filter:theme"][data-key="${theme.id}"]`)
		// if( btn ){
		// 	btn.classList.add('selected')
		// }
		// app.actions.action('filter:theme', 'show', ''+theme.id)
		
	}else if( hash != '' ){
		// page / feature
		console.log('OnHashChanged page', hash);

		// unselect all 
		document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
			el.classList.remove('selected')
		})

		// select 
		const btn = document.querySelector(`#sidebar [data-trigger="feat"][data-key="${hash}"]`)
		if( btn ){
			btn.classList.add('selected')
		}

		// action
		window.app.actions.clear_content()

		if( hash === 'about' ) 		window.app.actions.render_text(hash)
		if( hash === 'live' ) 		window.app.actions.render_live(hash)
		if( hash === 'videos' ) 	window.app.actions.render_videos(hash)
		if( hash === 'graduates' ) 	window.app.actions.render_students(hash)			
		
	}

}

export const initHashRouter = (listener) => {
  let h = window.location.hash || '#index'
  h = h.replace('#', '')
  
  window.addEventListener("hashchange", () => {
    let h = window.location.hash || '#index'
    h = h.replace('#', '')
    // console.log("hashchange event:", h);
    listener(h)
  });

  listener(h)
}