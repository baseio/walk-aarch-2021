import * as DATA from './data.js'

let firstLoad = true

export const handleHash = (rawHash) => {

	let hash = rawHash.replace('#', '')
	console.log('handleHash:', 'rawHash:', rawHash, 'hash:', hash)

	if( hash.indexOf('@') === 0 ){
		console.log('handleHash: LOCAL');
		return true
	}


	window.app.userDrawPlaying = false

	// console.log('OnHashChanged #2', app.balls);
	const b = window.app.balls.filter( b => b.el.userData.data.stub === hash )[0]
	// console.log('handleHash #3', b);
	
	// if $graduates is selected, just filter the text-list
	const inGraduatesMode = document.querySelector(`#sidebar [data-trigger="feat"][data-key="graduates"]`).classList.contains("selected")


	if( b ){
		// student
		console.log('handleHash: student', b)

		// Rev3 ADD
		// Check if we should hide the project link from this student
		const stub = b.el.userData.data.stub
		const sid  = b.el.userData.data.id
		// console.log('## LINK for:', id, sid, stub)
		if( DATA.DATA_EXCLUDE_PROJECTLINK.includes( sid ) ){
			console.log('## DONT OPEN PROJECT LINK for:', sid, stub)
		}else{
			const PROJECT_LINK = `https://afgang.aarch.dk/2021/student/${stub}`
			console.log('## OPEN PROJECT LINK:', PROJECT_LINK)
			window.open(PROJECT_LINK)
		}

		document.querySelectorAll(`#sidebar [data-trigger="theme"]`).forEach( (el) => {
			el.classList.remove('selected')
		})

		const theme = DATA.THEMES.filter(t => t.id === b.el.userData.data.theme)[0]
		const btn = document.querySelector(`#sidebar [data-trigger="theme"][data-key="${theme.slug}"]`)
		if( btn ){
			btn.classList.add('selected')
		}

		// window.app.animation.applyFilter('theme', theme.id)		

		window.app.actions.render_theme(theme)

		console.log('firstLoad:', firstLoad);
		if( firstLoad ){
			window.toFree()
			setTimeout( () => {
				window.app.animation.applyFilter('theme', theme.id)
			}, 500)


			setTimeout( () => {
				// show tooltip
				window.app.animation.showTooltip( b.el.position, b.el.userData.data.name )
			}, 1500)

		}

		/*

		const accepted = window.toNode( b.i )
		const theme_slug = DATA.THEMES.filter(t => t.id === b.el.userData.data.theme)[0]?.slug

		if( accepted ){
			// select theme
			const btn = document.querySelector(`#sidebar [data-trigger="theme"][data-key="${theme_slug}"]`)
			if( btn ){
				btn.classList.add('selected')
			}
		}
		*/

	}else if( rawHash.indexOf('#theme:') === 0 ){
		// theme
		console.log('handleHash: theme')

		hash = hash.split(':')[1]
		const slug  = hash.toLowerCase().replace(/ /g, '-')
		const theme = DATA.THEMES.filter(t => t.slug === slug )[0]

		console.log('OnHashChanged theme:', hash, slug, theme);

		
		if( inGraduatesMode ){
			console.log('OnHashChanged theme inGraduatesMode!');
			window.app.animation.applyFilter('theme', theme.id)
			window.app.actions.render_students_filtered(theme)
			return
		}

		// unselect all 
		document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
			el.classList.remove('selected')
		})

		// select
		const btn = document.querySelector(`#sidebar [data-trigger="theme"][data-key="${slug}"]`)
		if( btn ){
			btn.classList.add('selected')
		}

		console.log('firstLoad:', firstLoad);
		if( firstLoad ){
			window.toFree()
			setTimeout( () => {
				window.app.animation.applyFilter('theme', theme.id)
			}, 500)
		
		}else{
			window.app.animation.applyFilter('theme', theme.id)			
		}

		window.app.actions.render_theme(theme)	
	

	}else if( rawHash != '' ){
		// page / feature
		console.log('handleHash: page:', hash)
		console.log('handleHash: page:', hash, 'inGraduatesMode:', inGraduatesMode)

		// unselect all 
		document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
			el.classList.remove('selected')
		})

		// select 
		const btn = document.querySelector(`#sidebar [data-trigger="feat"][data-key="${hash}"]`)
		if( btn ){
			btn.classList.add('selected')
		}


		// due to the graduates+theme feature,
		// a click/route to #graduates when the hash is a $theme
		// needs to observe the dom:
		if( inGraduatesMode ){
			console.log('OnHashChanged page inGraduatesMode!');
			document.querySelector(`#sidebar [data-trigger="feat"][data-key="graduates"]`).classList.remove("selected")
			window.app.actions.clear_students_filter()
		}
		
		// action
		window.app.actions.clear_content()
		if( hash === 'about' ) 		window.app.actions.render_text(hash)
		if( hash === 'live' ) 		window.app.actions.render_live(hash)
		if( hash === 'videos' ) 	window.app.actions.render_videos(hash)
		if( hash === 'graduates' ) 	window.app.actions.render_students(hash)			
		
	}else if( window.location.hash === '' ){
		// index
		console.log('handleHash: index')
		
		// unselect all 
		document.querySelectorAll('#sidebar [data-trigger]').forEach( el => {
			el.classList.remove('selected')
		})

		window.app.actions.clear_content()
		window.app.actions.clear_students_filter()
	}


	firstLoad = false
}
