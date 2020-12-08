
import {	
	Sprite,
	SpriteMaterial,
} from 'three';

import TWEEN, { Tween, Easing, Interpolation, autoPlay } from 'es6-tween';


const ERASER_OPACITY_HIGH = 0.1
const ERASER_OPACITY_LOW = 0.001


export class Eraser {

	constructor(){
		const s = 100 // size

		this.to = 0
		
		this.material = new SpriteMaterial( { color: 0x000000, transparent: true, opacity:0 } )
		this.el = new Sprite( this.material );
		this.el.position.set( 0, 0, -2 );
		this.el.scale.set( s, s, 1 );
	}

	setTargetOpacity( opacity, time=300 ){
		this.tween = new Tween({v:this.material.opacity}).to({v:opacity}, time)
			// .easing(Easing.Back.InOut)
			// .easing(Easing.Bounce.InOut)
			// .easing( Easing.Elastic.InOut )
			.easing( Easing.Sinusoidal.InOut )
			.on('update', (o) => {
	   			this.material.opacity = o.v
	 		})
	 		.start()
	}

	// tweens opacity to OPACITY_HIGH
	blendUp(){
		this.setTargetOpacity( ERASER_OPACITY_HIGH )
	}

	// tweens opacity to OPACITY_LOW
	blendDown(){
		this.setTargetOpacity( ERASER_OPACITY_LOW )
	}

	// tweens up, then down after delay
	upDown( delay = 1000 ){
		this.blendUp()
		setTimeout( () => {
			this.blendDown()
		}, delay )	
	}

}