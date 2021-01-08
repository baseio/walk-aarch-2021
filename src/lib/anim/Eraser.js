
import {	
	Sprite,
	SpriteMaterial,
} from 'three';

import TWEEN, { Tween, Easing, Interpolation, autoPlay } from 'es6-tween';


const ERASER_OPACITY_HIGH = 0.1
const ERASER_OPACITY_LOW = 0.001

const ERASER_COLOR = 0x000000;


export class Eraser {

	constructor(){

		this.o  = 1
		this.to = 1
		
		this.material = new SpriteMaterial( { color: ERASER_COLOR, transparent: true, opacity:1 } )
		this.el = new Sprite( this.material );
		
		this.el.position.set( 0, 0, -100 );
		// this.el.position.set( 0, 0, 1.5 );
		
		const s = Math.max(window.innerWidth, window.innerHeight) // size
		this.el.scale.set( s, s, 1 );
	}

	setTargetOpacity( opacity, time=300 ){
		this.to = opacity
		// console.log('# Eraser setTargetOpacity', this.to);
	}

	// tweens opacity to OPACITY_HIGH
	blendUp( target = ERASER_OPACITY_HIGH ){
		// this.setTargetOpacity( target || ERASER_OPACITY_HIGH )
		this.to = target
		// console.log('# Eraser blendUp', this.to);
	}

	// tweens opacity to OPACITY_LOW
	blendDown(target = ERASER_OPACITY_LOW){
		// this.setTargetOpacity( target || ERASER_OPACITY_LOW )
		this.to = target || ERASER_OPACITY_LOW
		// console.log('# Eraser blendDown', this.to);
		this.material.transparent = true
	}

	// tweens up, then down after delay
	upDown( delay = 1000 ){
		this.blendUp()
		setTimeout( () => {
			this.blendDown()
		}, delay )	
	}

	clearScreen(){
		// console.log('# Eraser clearScreen');
		this.o = 1
		this.to = 1
		this.material.opacity = 1
		// this.material.transparent = false
		setTimeout( () => {
			this.material.transparent = true
			// console.log('# Eraser clearScreen > this.material.transparent:', this.material.transparent);
		}, 100 )	
	}

	update(){
		this.o = this.to - ((this.to - this.o) * 0.9)

		this.material.opacity = this.o
	}

}