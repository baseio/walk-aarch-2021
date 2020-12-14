import * as DATA from './data.js'

export const handleHash = (rawHash) => {

	let hash = rawHash.replace('#', '')
	console.log('handleHash:', 'rawHash:', rawHash, 'hash:', hash)

	// console.log('OnHashChanged #2', app.balls);
	const b = window.app.balls.filter( b => b.el.userData.data.stub === hash )[0]
	// console.log('OnHashChanged #3', b);
	

	if( b ){
		// student
		const accepted = window.toNode( b.i )
		console.log('OnHashChanged #4 accepted', accepted, b);
		
		const theme_slug = DATA.THEMES.filter(t => t.id === b.el.userData.data.theme)[0]?.slug
		console.log('OnHashChanged #4 theme id:', accepted, b.el.userData.data.theme, 'theme_slug:', theme_slug);


		if( accepted ){
			// select theme
			const btn = document.querySelector(`#sidebar [data-trigger="theme"][data-key="${theme_slug}"]`)
			if( btn ){
				btn.classList.add('selected')
			}
		}

	}else if( rawHash.indexOf('#theme:') === 0 ){
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
		// app.actions.action('filter:theme', 'show', ''+theme.id)
		window.app.animation.applyFilter('theme', theme.id)
		
	

	}else if( rawHash != '' ){
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
		if( hash === 'interact' ) 	window.app.actions.render_text(hash)

		if( hash === 'live' ) 		window.app.actions.render_live(hash)
		if( hash === 'videos' ) 	window.app.actions.render_videos(hash)
		if( hash === 'subjects' ) 	window.app.actions.render_students(hash)			
		
	}else if( window.location.hash === '' ){
		// index
		console.log('OnHashChanged index');

		// unselect all 
		document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
			el.classList.remove('selected')
		})


		window.toFree()
	}

}
