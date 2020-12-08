
import {
	
	Sprite,
	SpriteMaterial,
	
} from 'three';

import TWEEN, { Tween, Easing, Interpolation, autoPlay } from 'es6-tween';

import * as DATA from '../data.js'

export class CircleSprite {
	constructor(parent, i, texture){
		this.i = i
		this.enabled = true
		this.enabledSize = 0.1
		this.disabledSize = 0.01

		this.x = 0
		this.y = 0
		this.z = 0 //-0.25
		this.r = 0 //this.enabledSize


		
		this.tx = 0 //-1 + (2*Math.random())
		this.ty = 0 //-1 + (2*Math.random())
		this.tz = 0 //Math.random() //* drawingSize
		this.tr = 0 //this.enabledSize

		this.material = texture.clone()		

		this.el = new Sprite( this.material );
		this.el.position.set( this.x, this.y, this.z );
		this.el.userData.i = this.i
		this.el.userData.data = DATA.DATA_STUDENTS[this.i]

		
		this.el.scale.set(this.r,this.r,1);
		parent.add( this.el );

		this.setTarget(this.tx, this.ty)
		setTimeout( () => {
			this.r  = this.enabledSize
			this.tr = this.enabledSize
			this.tx = -1 + (2*Math.random())
			this.ty = -1 + (2*Math.random())
			this.tz = -1 + (2*Math.random())
			this.setTarget(this.tx, this.ty, this.tz)
		}, 1000)
	}
	setTarget(x, y, z){
		// console.log(x, y);
		this.tx = x || this.x
		this.ty = y || this.y
		this.tz = z || 0 //-1 + Math.random() * 2
		// this.r = 0

		
		
		this.tween = new Tween({x:this.x, y:this.y, z:this.z}).to({x:x, y:y, z:z}, 300)
			// .easing(Easing.Back.InOut)
			// .easing(Easing.Bounce.InOut)
			// .easing( Easing.Elastic.InOut )
			.easing( Easing.Sinusoidal.InOut )
			.on('update', (o) => {
	   			this.x = o.x
	   			this.y = o.y
	   			this.z = o.z
	 		})
	 		.start()
 		
		
	}

	normal(){
		this.material.color.set( '#fff' );
		this.tween = new Tween({r:this.r, o:this.material.opacity}).to({r:this.enabledSize, o:1}, 300)
			.easing(Easing.Sinusoidal.InOut)
			.on('update', (o) => {
	   			this.material.opacity = o.o
	   			this.r = o.r
	 		})
	 		.start()
	}

	hide(){
		this.material.color.set( '#fff' );

		this.tween = new Tween({r:this.r, o:this.material.opacity}).to({r:0, o:0}, 300)
			.easing(Easing.Sinusoidal.InOut)
			.on('update', (o) => {
	   			this.material.opacity = o.o
	   			this.r = o.r
	 		})
	 		.start()
	}

	focus(){

		this.material.color.set( '#fff' );

		this.tween = new Tween({x:this.x, y:this.y, r:this.r}).to({x:0, y:0, r:1}, 300)
			// .easing(Easing.Back.InOut)
			.easing(Easing.Sinusoidal.InOut)
			// .easing( Easing.Elastic.InOut )
			.on('update', (o) => {
	   			this.x = o.x
	   			this.y = o.y
	   			this.r = o.r
	 		})
	 		.start()
	}


	setEnabled(bool){
		this.enabled = bool

		// this.material.opacity = bool ? 1 : 0
		// this.r = bool ? 0.1 : 0.01

		new Tween({r:this.r}).to({r:bool?this.enabledSize:this.disabledSize}, 1000)
			.easing( Easing.Sinusoidal.InOut )
			.on('update', (o) => {
	   			this.r = o.r
	 		})
	 		.start()

	 	// new Tween({x:this.material.opacity}).to({x:bool?1:0}, 1000)
			// // .easing(Easing.Exponential.InOut)
			// .easing( Easing.Sinusoidal.InOut )
			// .on('update', (o) => {
	  //  			this.material.opacity = o.x
	 	// 	})
	 	// 	.start()
	}


	update(){
		this.el.scale.set(this.r,this.r,1);
	    this.el.position.set(this.x, this.y, this.z)
	}
}