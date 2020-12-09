import {
	Sprite,
	SpriteMaterial,	
} from 'three';

import * as DATA from '../data.js'

export class CircleSprite {
	constructor(parent, i, normalTexture, hoverTexture){
		this.i = i
		this.enabled = true

		this.enabledSize = 0.1
		// this.disabledSize = 0 //0.01

		this.normalTexture = normalTexture
		this.hoverTexture  = hoverTexture

		this.x  = 0
		this.y  = 0
		this.z  = 0
		this.o  = 0
		this.r  = 0

		this.tx = 0
		this.ty = 0
		this.tz = 0
		this.to = 0
		this.tr = 0

		this.material = new SpriteMaterial({
		    map: normalTexture,
		    transparent: true,
		    depthTest: false,
		    depthWrite: false,
		    color: 0xffffff
		});

		this.el = new Sprite( this.material );
		this.el.userData.i = this.i
		this.el.userData.data = DATA.DATA_STUDENTS[this.i]
		
		parent.add( this.el );
		
		setTimeout( () => {
			this.tx = -1 + (2*Math.random())
			this.ty = -1 + (2*Math.random())
			this.tz = -1 + (2*Math.random())
			this.to = 1
			this.tr = this.enabledSize
			this.setTarget({x:this.tx, y:this.ty, z:this.tz, o:this.to, r:this.tr})
		}, 10)
	}

	setTarget( obj ){
		
		const {x=this.x, y=this.y, z=this.z, o, r} = obj

		this.tx = x
		this.ty = y
		this.tz = z
		this.to = o || this.enabled ? 1 : 0
		this.tr = r || this.enabled ? this.enabledSize : 0
		
	}

	normal(){
		this.enabled = true
		this.material.color.set( '#fff' );
		this.setTarget({x:this.x, y:this.y, z:this.z, o:1, r:this.enabledSize})
		this.material.map = this.normalTexture
	}

	hide(){
		this.enabled = false
		this.material.color.set( '#fff' );
		this.setTarget({x:this.x, y:this.y, z:this.z, o:0, r:0})
		this.material.map = this.normalTexture
	}

	focus(){
		console.warn('TODO CircleSprite.focus: calc focused-size (using 8)');
		this.enabled = true
		this.setTarget({x:0, y:0, z:0, o:1, r:8})
		this.material.map = this.normalTexture
	}

	hover(){
		this.material.map = this.hoverTexture
		// this.material.color.set( '#09f' )
	}

	unhover(){
		this.material.map = this.normalTexture
		// this.material.color.set( '#fff' )
	}

	setEnabled(bool){
		this.enabled = bool
		if( this.enabled ){
			this.normal()
		}else{
			this.hide()
		}
	}

	update(){
		this.x = this.tx - ((this.tx - this.x) * 0.9)
		this.y = this.ty - ((this.ty - this.y) * 0.9)
		this.z = this.tz - ((this.tz - this.z) * 0.9)
		this.o = this.to - ((this.to - this.o) * 0.9)
		this.r = this.tr - ((this.tr - this.r) * 0.9)

		// this.o = Math.min(0.5, this.o)

		this.el.scale.set(this.r, this.r, 1);
	    this.el.position.set(this.x, this.y, this.z)
		this.material.opacity = this.o
	}
}