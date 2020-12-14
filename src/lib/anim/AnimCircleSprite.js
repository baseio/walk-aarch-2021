import {
	Sprite,
	SpriteMaterial,	
} from 'three';

// import { ComposedTexture } from '../../vendor/ComposedTexture.js'


import * as THREE from 'three'


export class AnimCircleSprite {
	constructor(parent, i, userdata, normalTexture, hoverTexture){
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
		this.el.userData.data = userdata

		///
		this.clock = new THREE.Clock;
		// const gifFile = 'https://media.giphy.com/media/4cUCFvwICarHq/giphy.gif'
		// const gifFile = 'https://media.giphy.com/media/26FPq8u5gvYO9GzoA/giphy.gif'
		const gifFile = './gifs/blue-128.gif'
		// if( this.i === 0 ){
			GIFLoader( gifFile, async ( container ) => {
				console.log(this.i, gifFile, 'loaded');
				// this.material.map = new ComposedTexture( container )
				// this.hoverTexture = new ComposedTexture( container )
				this.normalTexture = new ComposedTexture( container )
			});
		// }


		///
		
		parent.add( this.el );
		
		setTimeout( () => {
			this.tx = -1 + (2*Math.random())
			this.ty = -1 + (2*Math.random())
			this.tz = -1 + (2*Math.random())
			// this.to = 1
			this.tr = this.enabledSize
			this.setTarget({x:this.tx, y:this.ty, z:this.tz, o:this.to, r:this.tr})
		}, 10)

		setTimeout( () => {
			this.to = 1
			this.setTarget({x:this.tx, y:this.ty, z:this.tz, o:this.to, r:this.tr})
		}, 500)
	}

	setTarget( obj ){
		
		const {x=this.x, y=this.y, z=this.z, o, r} = obj

		this.tx = x
		this.ty = y
		this.tz = z
		this.to = o ? o : this.enabled ? 1 : 0
		this.tr = r ? r : this.enabled ? this.enabledSize : 0
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
		// console.warn('TODO AnimCircleSprite.focus: calc focused-size');
		this.enabled = true
		this.setTarget({x:0, y:0, z:0, o:1, r:3})
		this.material.map = this.normalTexture
	}

	hover(){
		this.material.map = this.hoverTexture
		this.tr = this.enabledSize * 1.5
		this.tz = -0.05
		// this.material.color.set( '#09f' )
	}

	unhover(){
		this.material.map = this.normalTexture
		this.tr = this.enabledSize
		this.tz = 0
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

		// this.material.map.update( this.clock.getDelta() );
		ComposedTexture.update( this.clock.getDelta() );
	}
}


const fileLoader = new THREE.FileLoader;
const textureLoader = new THREE.TextureLoader;



const GIFLoader = (function( url, complete ) {


    fileLoader.responseType = 'arraybuffer';
    fileLoader.load( url, async function( data ) {

		const gif = new GIF( data );

        /* Container, frames can be from any source, their structure is:

        Either patch or image, if a arraybuffer is provided it will be converted to an Image
        - patch (uncompressed Uint8Array)
        - image (Image element)

        - dims (left, top, width, height)
        - disposalType (number 0-3)
        - delay (number ms)

        */


        const container = {
            downscale: false,	// Canvas needs to be power of 2, by default size is upscaled (false)
            width: gif.raw.lsd.width,
            height: gif.raw.lsd.height,
            frames: gif.decompressFrames( true )
        };

        complete( container );

    });


});


// Copyright Mevedia UG - All Rights Reserved
// Author: Fyrestar <info@mevedia.com>

const ComposedTexture = function ComposedTexture( container, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	this.canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
	this.ctx = this.canvas.getContext( '2d' );

	if ( container ) {

		this.assign( container );

	}

	THREE.CanvasTexture.call( this, this.canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.version = 0;

};

ComposedTexture.copyCanvas = ( function () {

	let canvas, ctx;

	return {

		canvas: null,

		dispose: function () {

			this.canvas = canvas = ctx = null;

		},

		dataToImage: async function ( data, width, height ) {


			if ( !canvas ) {

				this.canvas = canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
				ctx = canvas.getContext( '2d' );

			}


			if ( width !== canvas.width || height !== canvas.height ) {

				canvas.width = width;
				canvas.height = height;

			}

			const imageData = ctx.getImageData( 0, 0, width, height );

			const buffer = imageData.data;

			for ( let i = 0, l = buffer.length; i < l; i++ )
				buffer[ i ] = data[ i ];

			ctx.putImageData( imageData, 0, 0 );

			return new Promise( resolve => {

				canvas.toBlob( blob => {

					const url = URL.createObjectURL( blob );

					const image = new Image;

					image.onload = function () {

						image.onload = null;

						URL.revokeObjectURL( url );

						resolve( image );

					};

					image.src = url;

				}, 'image/png' );

			} );

		}
	}

}() );
ComposedTexture.index = [];
ComposedTexture.update = function( delta ) {

	for ( let texture of this.index )
		texture.update( delta );

};

Object.assign( ComposedTexture.prototype, THREE.EventDispatcher.prototype, THREE.Texture.prototype, THREE.CanvasTexture.prototype, {

	isCanvasTexture: true,
	isComposedTexture: true,

	constructor: ComposedTexture,

	time: 0,
	duration: 0,
	frameTime: 0,
	frameIndex: 0,
	framePreviousIndex: -1,
	disposalType: 0,
	progressive: false,
	ready: false,

	loop: true,
	auto: true,
	autoplay: true,
	isPlaying: false,

	dispose: function () {

		this.container = this.ctx = this.canvas = null;


		if ( this.auto ) {

			const i = ComposedTexture.index.indexOf( this );
			if ( i > -1 ) ComposedTexture.index.splice( i, 1 );

        }

		this.dispatchEvent( { type: 'dispose' } );

	},

	pause: function() {

		this.isPlaying = false;

	},

	resume: function() {

		this.isPlaying = true;

	},

	play: function() {

		this.time = 0;
		this.frameIndex = 0;
		this.frameTime = 0;
		this.isPlaying = true;

	},

	stop: function() {

		this.time = 0;
		this.frameIndex = 0;
		this.frameTime = 0;
		this.isPlaying = false;

		this.compose( this.frameIndex );

	},

	update: function( delta ) {


		if ( this.isPlaying ) {

			const container = this.container;

			const frame = container.frames[ this.frameIndex ];


			const t = delta * 1000;

			this.frameTime += t;
			this.time = Math.min( this.duration, this.time + t ) ;

			if ( this.frameTime >= frame.delay ) {

				this.frameTime = 0;


				if ( this.frameIndex < container.frames.length - 1 ) {

					this.frameIndex ++ ;

				} else {

					if ( this.loop ) {

						this.time = 0;
						this.frameIndex = 0;

					} else {

						this.pause();

					}

				}

				this.compose( this.frameIndex );

			}



		}


	},

	assign: async function ( container ) {

		this.stop();

		this.auto = container.auto !== undefined ? container.auto : true;
		this.duration = 0;
		this.frameIndex = 0;
		this.framePreviousIndex = -1;
		this.disposalType = 0;
		this.progressive = true;
		this.ready = false;
		
		

		// Auto playback for all textures

		if ( this.auto && ComposedTexture.index.indexOf( this ) == -1 )
			ComposedTexture.index.push( this );

		let { width, height } = container;

		const powerOfTwo = container.downscale ? THREE.Math.floorPowerOfTwo : THREE.Math.ceilPowerOfTwo;

		if ( !THREE.Math.isPowerOfTwo( container.width ) )
			width = powerOfTwo( container.width );

		if ( !THREE.Math.isPowerOfTwo( container.height ) )
			height = powerOfTwo( container.height );

		this.canvas.width = width;
		this.canvas.height = height;

		this.container = container;

		for ( let frame of container.frames ) {

			this.duration += frame.delay;

			if ( frame.disposalType > 1 )
				this.progressive = false;

			if ( !frame.image ) {

				frame.image = await ComposedTexture.copyCanvas.dataToImage( frame.patch, frame.dims.width, frame.dims.height );

			}

		}

		this.ready = true;

		this.dispatchEvent( { type: 'ready' } );

		if ( this.autoplay )
			this.play();


	},

	compose: function ( frameIndex ) {


		if ( this.ready ) {

			this.frameIndex = frameIndex;

			if ( this.progressive && ( this.framePreviousIndex > frameIndex || this.framePreviousIndex + 1 < frameIndex ) ) {

				// Needs to re-compose missing frames

				this.ctx.clearRect( 0, 0, this.width, this.height );

				for ( let i = 0; i <= frameIndex; i++ )
					this._render( i );

			} else if ( frameIndex !== this.framePreviousIndex ) {

				this._render( frameIndex );

			}

			this.framePreviousIndex = frameIndex;

		} else if ( this.idleRender instanceof Function ) {

			this.idleRender( this.ctx );

		}

	},

	_render: function ( frameIndex ) {

		if ( frameIndex === 0 )
			this.frameRestoreIndex = -1;

		const {
			ctx,
			container,
			canvas,
			disposalType
		} = this;

		const currentFrame = container.frames[ frameIndex ];
		const dims = currentFrame.dims;

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		ctx.scale( canvas.width / container.width, canvas.height / container.height );


		if ( frameIndex > 0 ) {

			if ( disposalType === 3 ) {


				// Restore to previous

				if ( this.frameRestoreIndex > -1 ) {

					const restoreFrame = container.frames[ this.frameRestoreIndex ];
					const dims = restoreFrame.dims;

					if ( restoreFrame.blend === 0 )
						ctx.clearRect( dims.left, dims.top, dims.width, dims.height );

					ctx.drawImage( restoreFrame.image, dims.left, dims.top, dims.width, dims.height );

				} else {

					// Nothing to restore, clear

					ctx.clearRect( dims.left, dims.top, dims.width, dims.height );

				}

			} else {

				this.frameRestoreIndex = Math.max( frameIndex - 1, 0 );

			}

			if ( disposalType === 2 && this.frameRestoreIndex > -1 ) {

				const restoreFrame = container.frames[ this.frameRestoreIndex ];
				const dims = restoreFrame.dims;

				ctx.clearRect( dims.left, dims.top, dims.width, dims.height );

			}


		}

		if ( currentFrame.blend === 0 )
			ctx.clearRect( dims.left, dims.top, dims.width, dims.height );

		ctx.drawImage( currentFrame.image, dims.left, dims.top, dims.width, dims.height );


		this.disposalType = currentFrame.disposalType;

		// Flag texture for upload

		this.version ++ ;

	}

} );