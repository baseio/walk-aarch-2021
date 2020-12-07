import {
	WebGLRenderer,
	Scene,
	Clock,
	Color,
	Group,
	PerspectiveCamera,
	SpriteMaterial,
	Sprite,
	Raycaster,
	Vector2,
	Vector3,
	Quaternion,
	Texture,
	WebGLRenderTarget,
	ShaderMaterial,
	OrthographicCamera
} from 'three';

import TWEEN, { Tween, Easing, Interpolation, autoPlay } from 'es6-tween';

// TODO: investigate custom build at http://fabricjs.com/build/
// import { fabric } from "../../vendor/fabric.all.js" // all things included - wont bundle :(
import { fabric } from "fabric"

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


import {showDrawDemo, hideDrawDemo} from './drawdemo.js'


import {Logo, LogoShader} from './Logo.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

import { LogoShaderPass } from './LogoShaderPass.js';


// import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';
// import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader.js';

let composer
let afterimagePass



import * as DATA from '../data.js'

import './styles.anim.css'

const USERDRAW_SELECTOR = 'userdraw'
const K_TRAILS_ENABLED 	= true
let K_AUTO_ROTATION 	= false
const K_JAGGED_ROTATION	= false
const K_ERASER_OPACITY 	= 0 //0.01 // 0.065 //0.05 // 0.01
let BACKGROUNDCOLOR_HEX = '#000000'

let FOV = 50 //130 //190

let camera, renderer, scene
let controls, clock, group
let eraser, logo

let generated_texture
let targetQuat, originQuat
let cameraTarget

let currentPath;
let currentFilter;
let currentThemeFilterValue = ''

export const initAnimation = (selector) => {
	autoPlay(true)
	
	init_userdraw()
	init_scene(selector)
	init_balls()
	update()
	

	return this
}

export const setFilter = (key) => {
	currentFilter = key
}

export const applyFilter = (key, val) => {
	// we want to be able to filter on a theme AND search for a NAME at the same time
	// console.log('#A Animation applyFilter', key, val);
	
	if( key ){
		currentFilter = key
	}


	if( currentFilter === 'all' ){
		return;
	}

	if( currentFilter === 'theme' ){
		currentThemeFilterValue = val
		const t = DATA.THEMES_EN.filter(t => t.id === val)[0]

		const includedBalls = []
		balls.forEach( ball => {
			ball.tween.stop()
			if( val === false || ball.el.userData.data.theme === currentThemeFilterValue ){
				includedBalls.push(ball.i)
			}
		})

		balls.forEach( ball => {
			if( includedBalls.includes( ball.i ) ){
				ball.setEnabled(true)	
			}else{
				ball.setEnabled(false)		
			}
		})
	}

	if( currentFilter === 'student' ){

	}

	// 

	// eraserMaterial.opacity = 0.1
	// setTimeout( () => {
	// 	eraserMaterial.opacity = K_ERASER_OPACITY
	// }, 100)
	eraser.upDown()
	
}


///

let width = window.innerWidth // / 2
const drawingSize = 200; //width * 0.75 // width of the drawing canvas. Also used to scale the path coords
let uc = document.querySelector('#'+USERDRAW_SELECTOR)
uc.setAttribute('width',  `${drawingSize}px`)
uc.setAttribute('height', `${drawingSize}px`)




const generate_texture = () => {
	const canvas = document.createElement('canvas');
	const size = 512 //window.innerWidth;
	canvas.width = size;
	canvas.height = size;
	const c = canvas.getContext('2d');

    c.lineWidth = 10
    c.strokeStyle = '#000';
    c.strokeStyle = '#eee';
    c.fillStyle = '#fff';
	const s = size/2;
	c.beginPath();
    c.arc(s, s, s-c.lineWidth, 0, Math.PI * 2, false);

    c.stroke();

    c.fill();
    c.closePath();

    const map = new Texture(canvas);
	map.needsUpdate = true;

	return new SpriteMaterial({
	    map: map,
	    transparent: true,
	    // useScreenCoordinates: false,
	    depthTest: false,
	    depthWrite: false,
	    color: 0xffffff
	});

}


const ERASER_OPACITY_HIGH = 0.1
const ERASER_OPACITY_LOW = 0.001

class Eraser {


	constructor(){
		const s = 100 // size

		this.to = 0
		
		this.material = new SpriteMaterial( { color: BACKGROUNDCOLOR_HEX, transparent: true, opacity:0 } )
		this.el = new Sprite( this.material );
		this.el.position.set( 0, 0, -2 );
		this.el.scale.set( s, s, 1 );

		console.log('Eraser', ERASER_OPACITY_HIGH, ERASER_OPACITY_LOW);
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


let overlayBuffer, overlayCamera, overlayMaterial, overlayShaderPass, overlayScene
let sceneRenderPass
let logoShaderPass

const init_scene = (selector) => {

	generated_texture = generate_texture()

	window.addEventListener( 'resize', OnWindowResize, false );
	window.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.querySelector('#animation').addEventListener('click', onDocumentMouseDown );

	if( K_TRAILS_ENABLED ){
		renderer = new WebGLRenderer( { preserveDrawingBuffer: true, antialias: true } );
	}else{
		renderer = new WebGLRenderer( { antialias: true } );
	}

	renderer.autoClearColor = BACKGROUNDCOLOR_HEX
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, window.innerHeight );
	renderer.domElement.id = 'three'
	document.querySelector(selector).appendChild( renderer.domElement );

	clock = new Clock();

	scene = new Scene();
	scene.background = BACKGROUNDCOLOR_HEX

	


	cameraTarget = scene.position

	group = new Group();
	group.rotation.set( 0, Math.PI, Math.PI);
	scene.add( group );


	camera = new PerspectiveCamera( 190, window.innerWidth / window.innerHeight, 0.001, 10 );
	// camera.position.set( 0, 0, 20 );

	let dist = 1 / 2 / Math.tan(Math.PI * FOV / 360);
	dist += 0.4
	
	// camera.position.set(0,0,dist)
	const cameraTween = new Tween({z:10, fov:camera.fov}).to({z:dist, fov:FOV}, 5000)
			// .easing(Easing.Back.InOut)
			// .easing(Easing.Bounce.InOut)
			.easing( Easing.Sinusoidal.InOut )
			.on('update', (o) => {
				if( MODE != 'grid') {
		   			camera.position.set(0,0,o.z)
		   			camera.fov = o.fov
		   			camera.updateProjectionMatrix();
		   		}
	 		})
	 		.start()
 		


	camera.lookAt( cameraTarget );
	scene.add( camera );
	window.camera = camera
	window.group = group

	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableRotate = true;
	controls.enableDamping = true;
	controls.dampingFactor = 0.02;
	// controls.minDistance = 10;
	// controls.maxDistance = 100;
	// controls.maxPolarAngle = Math.PI * 0.5;
	// controls.saveState()
	window.app.controls = controls

	controls.update()
	camera.lookAt( group.position );
	renderer.render( scene, camera );
	controls.saveState()

	targetQuat = new Quaternion().setFromEuler(group.rotation)
	originQuat = new Quaternion().setFromEuler(group.rotation)

	
	eraser = new Eraser()
	
	if( K_TRAILS_ENABLED ){
		renderer.autoClearColor = false;
		scene.add( eraser.el );
		eraser.blendDown()
	}

	setTimeout( () => {
		K_AUTO_ROTATION = true
	}, 100 );



	// ---------
	/*

	const w = window.innerWidth
	const h = window.innerHeight
	composer = new EffectComposer( renderer );

	// sceneRenderPass = new RenderPass( scene, camera )

	// composer.addPass( sceneRenderPass );

	// composer.addPass( new AfterimagePass(0.99) );

	

	overlayBuffer = new WebGLRenderTarget(w, h)
	overlayCamera = new OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 2000)
	// overlayCamera.position.z = 10

	overlayScene = new Scene()
	logo = new Logo(overlayScene)


	const sceneRT = new WebGLRenderTarget(w, h)
	const logoRT = new WebGLRenderTarget(w, h)

	// camera.renderToScreen = false
	renderer.setRenderTarget( sceneRT )
	// logoRenderer.setRenderTarget( logoRT )
	
	// renderer.render(scene, camera)
	// logoRenderer.render(overlayScene, overlayCamera)

	logoShaderPass = new LogoShaderPass()
	// logoShaderPass.uniforms.overlayBuffer = logo
	composer.addPass( new RenderPass( scene, camera ) );
	composer.addPass( new RenderPass( overlayScene, overlayCamera) );
	composer.addPass( logoShaderPass );

	// renderer.render( scene, camera );



	// render logo to a rt, send it to logoshaderpasss


	// overlayMaterial = new ShaderMaterial(LogoShader)
	// overlayMaterial.uniforms.overlayBuffer.value = overlayBuffer.texture
	

	// overlayShaderPass = new ShaderPass(overlayMaterial)
	// // overlayShaderPass.renderToScreen = true

	// composer.addPass(overlayShaderPass)

	*/

}

const OnWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

const init_userdraw = () => {
	var lastPath = null
	var canvas = new fabric.Canvas(USERDRAW_SELECTOR)
	// canvas.backgroundColor = '#efefef';
	canvas.backgroundColor = '#fff';
    canvas.isDrawingMode= 1;
    canvas.freeDrawingBrush.color = '#000'
    canvas.freeDrawingBrush.width = 10 //20;
    canvas.renderAll();

    canvas.on('mouse:down', (e) => {
	    if( lastPath ){
	    	canvas.remove(...canvas.getObjects());
	    }
	});

    canvas.on('path:created', (e) =>{
	    lastPath = e.path;
	    process_userpath(lastPath)
	});

    // demo
    setTimeout( () => {
    	showDrawDemo()
    }, 2000 )
}

const process_userpath = (fabricPath) => {
	const svg = fabricPath.toSVG()
	const parser = new DOMParser();
	const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, 'image/svg+xml');
	const path = doc.querySelector('path')

	currentPath = path

	// applyFilter('all')
	
	const length = path.getTotalLength()
	const inc = length / numballs

	// const elapsedTime = clock.getElapsedTime();
	// scene.rotation.y = elapsedTime * 0.5;

	// eraserMaterial.opacity = 1
	// eraserMaterial.opacity = 0.1
	eraser.blendUp()
	// setTimeout( () => {
	// 	eraserMaterial.opacity = K_ERASER_OPACITY
	// }, 100)

	MODE = 'free'

	let delay = 0
	for(let i=0; i<numballs; i++){	
		const p = path.getPointAtLength( inc * i)
		// console.log(drawingSize, p.x, p.y);
		const sx = -1 + (2* (p.x / drawingSize ))
		const sy = -1 + (2* (p.y / drawingSize )) //p.y / width	

		delay = i * 10
		setTimeout( () => {
			balls[i].setTarget(sx, sy, 0)
		}, delay)
	}

	setTimeout( () => {
		// eraserMaterial.opacity = K_ERASER_OPACITY
		eraser.blendDown()
	}, delay + 1000)

	

}


let orient = {x:0, y:0, z:0}
let axisIndex = 0

const jaggedCamera = (source) => {
	if( !source) source = {x:group.rotation.x, y:group.rotation.y, z:group.rotation.z}
	new Tween(source).to(orient, 1000)
		.easing(Easing.Quadratic.InOut)
		.on('update', (o) => {
			if( K_JAGGED_ROTATION ){
	   			group.rotation.x = o.x
	   			group.rotation.y = o.y
	   			group.rotation.z = o.z
	   		}
   			
 		})
 		.on('complete', (o) => {
			let a = ++axisIndex % 2
			// console.log(a);
			if( a === 0 ) orient.x = group.rotation.x + (Math.PI/180) * 90
			if( a === 1 ) orient.y = group.rotation.y + (Math.PI/180) * 90
			// if( a === 0 ) orient.z = group.rotation.z + (Math.PI/180) * 90

			setTimeout( () => {
				jaggedCamera( {x:group.rotation.x, y:group.rotation.y, z:group.rotation.z} )
			}, 500)

		})
		.start()
		
		// camZoom()
}

const camZoom = () => {

	const v = 2
	const z = -v + (2* (Math.random() * v))

	new Tween({z:group.position.z}).to({z:z}, 1000)
		.easing( Easing.Quadratic.InOut )
		.on('update', (o) => {
   			group.position.z = o.z   			
 		})
		.start()
}


const onDocumentMouseDown = () => {
	console.log('onDocumentMouseDown', MODE, previousSelectedObjectId);
	if( previousSelectedObjectId ){
		console.log('select node', DATA.DATA_STUDENTS[previousSelectedObjectId].name );
		window.location.href = '#'+ DATA.DATA_STUDENTS[previousSelectedObjectId].stub

		toNode( previousSelectedObjectId )

	}else{
	 	if( MODE != 'free') toFree()
	}


}
let MODE = 'free'

const reset_rotations = () => {
	controls.enableRotate  = false;
	controls.enableDamping = false;
	controls.reset()

	group.rotation.set( 0, Math.PI, Math.PI);
}

window.toFree = () => {
	console.log('toFree');
	controls.enableRotate  = true;
	controls.enableDamping = true;
	MODE = 'free'

	balls.forEach( ball => {
		ball.normal()
	})
}

window.toNode = (id) => {
	MODE = 'node'
	const sball = balls[id]

	console.log('toNode', toNode, sball);

	//reset_rotations()

	balls.forEach( ball => {
		if( ball.i != sball.i ){
			// ball.r = ball.disabledSize
			ball.hide()
		}
	})
	
	// sball.material.color.set( '#fff' );
	//sball.r = 1
	// sball.setTarget(0, 0, 0)
	// sball.setTarget(0, 0, -0.25)
	sball.focus()

	let dist = 1 / 2 / Math.tan(Math.PI * camera.fov / 360);
	dist += 0.1 // fits in screen
	
	dist = 0.5 // fills screen
	camera.position.set(0,0,dist)

	console.log('dist', dist);
}

window.toGrid = () => {
	
	MODE = 'grid'
	// eraserMaterial.opacity = 1 //0.1
	// setTimeout( () => {
	// 	eraserMaterial.opacity = K_ERASER_OPACITY
	// }, 1000)
	eraser.upDown()
	
	reset_rotations()

	camera.position.set(0,0,2)
	camera.fov = FOV
	camera.updateProjectionMatrix();

	const targetPositions = []
		
	const scale = 0.1
	const cols = Math.floor( Math.sqrt(numballs))

	let y = -(cols / 2) * scale
	let sx = -(cols / 2) * scale

	balls.forEach( b => {

		let x = sx + ( b.i % cols ) * scale
		if( b.i % cols === 0 ) y += scale
		
		targetPositions.push({x,y,z:0})
	})

	for(let i=0; i<numballs; i++){	
		const p = targetPositions[i]
		setTimeout( () => {
			balls[i].setTarget(p.x, p.y, p.z)
		}, 10 + 10 * i)
	}
}



let balls = []
let numballs = DATA.DATA_STUDENTS.length || 20
console.log('DATA', DATA.DATA_STUDENTS.length);

const init_balls = () => {
	// const parent = document.querySelector('#left')
	for(let i=0; i<numballs; i++){
		balls.push( new Ball(group, i))
	}

	window.app.balls = balls
}



class Ball {
	constructor(parent, i){
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

		this.material = generated_texture.clone()		

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

		new Tween({x:this.r}).to({x:bool?this.enabledSize:this.disabledSize}, 1000)
			// .easing(Easing.Exponential.InOut)
			.easing( Easing.Sinusoidal.InOut )
			.on('update', (o) => {
	   			this.r = o.x
	 		})
	 		.start()

	 	new Tween({x:this.material.opacity}).to({x:bool?1:0}, 1000)
			// .easing(Easing.Exponential.InOut)
			.easing( Easing.Sinusoidal.InOut )
			.on('update', (o) => {
	   			this.material.opacity = o.x
	 		})
	 		.start()
	}


	update(){
		this.el.scale.set(this.r,this.r,1);
	    this.el.position.set(this.x, this.y, this.z)
	}
}

const update = () => {

	requestAnimationFrame(update)

	balls.forEach( b => b.update() )

	controls.update()

	const speed = 0.5 //2.7

	const elapsedTime = clock.getElapsedTime();
	if( K_AUTO_ROTATION && MODE === 'free'){
		group.rotation.y = elapsedTime * speed;
		group.rotation.x = elapsedTime * speed;
		group.rotation.z = elapsedTime * speed;
	
	}

	targetQuat = targetQuat.setFromEuler(group.rotation)
	group.quaternion.slerp(targetQuat, 0.01);

	// composer.render();
	renderer.render( scene, camera );
}


let selectedObject = null;
let previousSelectedObjectId = null

function onDocumentMouseMove( event ) {
	
	if( MODE != 'grid' ) return
	if( event.target.id != renderer.domElement.id ) return

	event.preventDefault();
	
	if ( selectedObject ) {		
		selectedObject.material.color.set( '#fff' );
		selectedObject = null;
	}


	const intersects = getIntersects( event.layerX, event.layerY );

	if( intersects.length > 0 ){
		const res = intersects.filter(res => res && res.object)[0];
		if( res && res.object ){
			selectedObject = res.object;
			const data = selectedObject.userData
			const ball = balls[ data.i ]
			if( ball.enabled ){
				if( previousSelectedObjectId != data.i ){
					console.log(data.name);
					window.app.actions.setStudentSelected( data.data )
					if( document.querySelectorAll('#sidebar [data-key="students"].selected').length ){
						window.app.actions.render_students('')
					}
				}
				previousSelectedObjectId = data.i
				selectedObject.material.color.set( '#f00' );
			}
		}
	}else{
		if( previousSelectedObjectId ){
			previousSelectedObjectId = null
			console.log('hide stud');
			window.app.actions.setStudentSelected( {stub:''} )
			if( document.querySelectorAll('#sidebar [data-key="students"].selected').length ){
				window.app.actions.render_students('')
			}
		}
	}
}

const raycaster = new Raycaster();
const mouseVector = new Vector3();

function getIntersects( x, y ) {

	x = ( x / width ) * 2 - 1;
	y = - ( y / window.innerHeight ) * 2 + 1;

	mouseVector.set( x, y, 0.5 );
	raycaster.setFromCamera( mouseVector, camera );

	return raycaster.intersectObject( group, true );

}


