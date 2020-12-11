// Thinking is that all (and our) FX (thats the visual 'effect' or themes)
// should inherit (and implement the methods defined here).
// This is to make it easier to develop other FX around this very
// same site... as Karen wanted

export class FXBase {
	
	constructor(){

	}

	// abstract

	init(){}

	setFilter(key, val){}

	releaseFilter(key){}

	pause(){}

	resume(){} // or play()?

	


}