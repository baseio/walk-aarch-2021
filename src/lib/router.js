
export class Router {
	constructor( routeFunction ){
		this.history = []

		if( !routeFunction ) console.error('Router Error: You must provide a routing funtion')
		
		this.routeFunction = routeFunction

		// this.initHashRouter(this.routeFunction)

		window.addEventListener('hashchange', this.OnHashChanged.bind(this) )

		this.OnHashChanged()
	}

	OnHashChanged(){
		const h = window.location.hash
		// console.log('router: OnHashChanged:', h);
		
		this.history.push(h)

		// let h = window.location.hash || '#index'
  		// h = h.replace('#', '')
    	this.routeFunction( h )
	}

	routeFunction(hash){
		console.warn('Router default routeFunction called. Should be overridden! hash:', hash);
	}

	back(){
		window.location.hash = this.history.pop()
	}

	/*
	initHashRouter(listener){
		this.history.push(window.location.hash)

		let h = window.location.hash || '#index'
		h = h.replace('#', '')
	  	
	  	window.addEventListener("hashchange", () => {
	  		this.history.push(window.location.hash)

	    	let h = window.location.hash || '#index'
	    	h = h.replace('#', '')
	    	// console.log("hashchange event:", h);
	    	listener(h)
	    });

  		listener(h)
	}
	*/

}

