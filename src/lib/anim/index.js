// import * as THREE from 'three';

import {
	WebGLRenderer,
	Scene,
	Clock,
	Color,
	Group,
	PerspectiveCamera,
	SpriteMaterial,
	Sprite,
	// TextureLoader,
	Raycaster,
	Vector3,
	Quaternion,
	Texture
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN, { Tween, Easing, Interpolation, autoPlay } from 'es6-tween';

import { RotationController } from './RotationController.js'

import { fabric } from "fabric"

// TODO: investigate custom build at http://fabricjs.com/build/
// import { fabric } from "../../vendor/fabric.all.js" // all things included - wont bundle :(

import * as DATA from '../data.js'

import './styles.anim.css'

const USERDRAW_SELECTOR = 'userdraw'


let currentPath;
let currentFilter;
let currentThemeFilterValue = ''

export const initAnimation = (selector) => {
	autoPlay(true); // TWEEN auto-runs the loop-frames
	
	init_userdraw()
	init_scene(selector)
	init_balls()
	update()
	// jaggedCamera()

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

	eraserMaterial.opacity = 0.1
	setTimeout( () => {
		eraserMaterial.opacity = K_ERASER_OPACITY
	}, 100)
	
}


///

let width = window.innerWidth // / 2
const drawingSize = 200; //width * 0.75 // width of the drawing canvas. Also used to scale the path coords
let uc = document.querySelector('#'+USERDRAW_SELECTOR)
uc.setAttribute('width',  `${drawingSize}px`)
uc.setAttribute('height', `${drawingSize}px`)



let camera, renderer, scene;
let controls, clock, group;
let fadeMesh;
let eraserMaterial;
let generated_texture;

const K_TRAILS_ENABLED 	= true
let K_AUTO_ROTATION 	= false
const K_JAGGED_ROTATION	= false
const K_ERASER_OPACITY 	= 0.01


let targetQuat, originQuat
let _group

let rotationController

const generate_texture = () => {
	const canvas = document.createElement('canvas');
	const size = 512;
	canvas.width = size;
	canvas.height = size;
	const c = canvas.getContext('2d');

	const s = size/2;
	c.beginPath();
    c.arc(s, s, s-10, 0, Math.PI * 2, false);
    c.fillStyle = '#fff';
    c.fill();
    c.closePath();

    const map = new Texture(canvas);
	map.needsUpdate = true;

	return new SpriteMaterial({
	    map: map,
	    // transparent: false,
	    // useScreenCoordinates: false,
	    color: 0xffffff
	});

    // new SpriteMaterial( { map: map, color: 0xffffff , fog: true } );

	// context.fillStyle = '#ff0000'; // CHANGED
	// context.textAlign = 'center';
	// context.font = '24px Arial';
	// context.fillText("some text", size / 2, size / 2);
}



const init_scene = (selector) => {

	generated_texture = generate_texture()

	window.addEventListener( 'resize', OnWindowResize, false );
	window.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'mousedown', onDocumentMouseDown, false );

	if( K_TRAILS_ENABLED ){
		renderer = new WebGLRenderer( { preserveDrawingBuffer: true, antialias: true } );
	}else{
		renderer = new WebGLRenderer( { antialias: true } );
	}

	renderer.autoClearColor = '#00ffff';	
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, window.innerHeight );
	renderer.domElement.id = 'three'
	document.querySelector(selector).appendChild( renderer.domElement );

	clock = new Clock();

	scene = new Scene();
	scene.background = new Color( 0x00ffff );

	group = new Group();
	group.rotation.set( 0, Math.PI, Math.PI);
	scene.add( group );

	_group = new Group();
	scene.add( _group );

	camera = new PerspectiveCamera( 50, width / window.innerHeight, 0.1, 10 );
	camera.position.set( 0, 0, 2 );
	camera.lookAt( scene.position );
	scene.add( camera );


	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableRotate = true;
	controls.enableDamping = true;
	controls.dampingFactor = 0.02;
	// controls.saveState()
	window.app.controls = controls

	// rotationController = new RotationController(group)

	eraserMaterial = new SpriteMaterial( { color: '#00ffff', transparent: true, opacity:1 } )
	var eraser = new Sprite( eraserMaterial );
	eraser.position.set( 0, 0, -2 );
	const s = 100
	eraser.scale.set( s, s, 1 );
	
	if( K_TRAILS_ENABLED ){
		renderer.autoClearColor = false;
		scene.add( eraser );
	}

	setTimeout( () => {
		eraserMaterial.opacity = K_ERASER_OPACITY
	}, 100)


	controls.update()
	camera.lookAt( group.position );
	renderer.render( scene, camera );
	controls.saveState()

	targetQuat = new Quaternion().setFromEuler(group.rotation)
	originQuat = new Quaternion().setFromEuler(group.rotation)


	setTimeout( () => {
		K_AUTO_ROTATION = true
		// toGrid()
	}, 100 );
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

	eraserMaterial.opacity = 1
	setTimeout( () => {
		eraserMaterial.opacity = K_ERASER_OPACITY
	}, 100)

	MODE = 'free'

	for(let i=0; i<numballs; i++){	
		const p = path.getPointAtLength( inc * i)
		// console.log(drawingSize, p.x, p.y);
		const sx = -1 + (2* (p.x / drawingSize ))
		const sy = -1 + (2* (p.y / drawingSize )) //p.y / width	
		setTimeout( () => {
			balls[i].setTarget(sx, sy)
		}, 10 + 10 * i)
	}

	

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
	console.log('onDocumentMouseDown', MODE);
	if( MODE != 'free') toFree()
}
let MODE = 'free'

window.toFree = () => {
	controls.enableRotate  = true;
	controls.enableDamping = true;
	MODE = 'free'
}

window.toGrid = () => {
	

	MODE = 'grid'
	eraserMaterial.opacity = 1
	setTimeout( () => {
		eraserMaterial.opacity = K_ERASER_OPACITY
	}, 100)

	controls.enableRotate  = false;
	controls.enableDamping = false;
	controls.reset()

	// const q = new Quaternion() //.setFromAxisAngle( new Vector3(0, Math.PI, Math.PI) )
	// _group.quaternion.slerp( q, 1);
	_group.rotation.set( 0, Math.PI, Math.PI);

	// targetQuat = originQuat.clone()
	// group.quaternion.slerp( originQuat, 1);

	const scale = 0.1

	const cols = Math.floor( Math.sqrt(numballs))

	
	let y = -(cols / 2) * scale
	let sx = -(cols / 2) * scale

	balls.forEach( b => {

		let x = sx + ( b.i % cols ) * scale
		if( b.i % cols === 0 ) y += scale
		

		b.setTarget(x, y, 0)
	})
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
		this.z = -0.25
		this.r = this.enabledSize
		
		this.tx = -1 + (2*Math.random())
		this.ty = -1 + (2*Math.random())
		this.tz = Math.random() //* drawingSize
		this.tr = this.enabledSize

		this.material = generated_texture.clone()		

		this.el = new Sprite( this.material );
		this.el.position.set( this.x, this.y, this.z );
		this.el.userData.i = this.i
		this.el.userData.data = DATA.DATA_STUDENTS[this.i]

		
		this.el.scale.set(this.r,this.r,1);
		parent.add( this.el );

		this.setTarget(this.tx, this.ty)
	}
	setTarget(x, y, z){
		// console.log(x, y);
		this.tx = x
		this.ty = y
		this.tz = z || -1 + Math.random() * 2
		// this.r = 0

		
		
		this.tween = new Tween({x:this.x, y:this.y}).to({x:x, y:y}, 300)
			// .easing(Easing.Back.InOut)
			.easing(Easing.Bounce.InOut)
			// .easing( Easing.Elastic.InOut )
			.on('update', (o) => {
	   			this.x = o.x
	   			this.y = o.y
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
		// Lerp towards tx,ty
	    // this.x = this.tx - (this.tx - this.x) * 0.9
	    // this.y = this.ty - (this.ty - this.y) * 0.9
	    // // this.z = this.tz - (this.tz - this.z) * 0.9	    
	    // this.r = this.tr - (this.tr - this.r) * 0.9

	    // if( this.i > 0 ){
	    // 	let p = balls[this.i-1]
	    // 	if( Math.abs(p.x - p.tx) < 1 && Math.abs(p.y - p.ty) < 1 ){
	    // 		this.x = this.tx // - (this.tx - this.x) * 0.9
	    // 		this.y = this.ty // - (this.ty - this.y) * 0.9
	    // 	}else{
	    // 		this.x = p.tx - (p.tx - this.x) * 0.9
	    // 		this.y = p.ty - (p.ty - this.y) * 0.9
	    // 	}
	    // }

	    // this.r = 20 //this.tr - (this.tr - this.r) * 0.9

	    
	    // this.material.opacity = this.enabled ? 1 : 0.1
	    
	    this.el.scale.set(this.r,this.r,1);
	    this.el.position.set(this.x, this.y, this.z)

		// this.el.style = `left:${this.x}px;top:${this.y}px;width:${this.r}px;height:${this.r}px;margin-top:${-this.r/2}px;margin-left:${-this.r/2}px`;
	}
}

const update = () => {
	// console.log('anim update');
	requestAnimationFrame(update)
	balls.forEach( b => b.update() )

	controls.update()

	// rotationController.update()

	camera.lookAt( group.position );

	const speed = 0.5 //2.7

	const elapsedTime = clock.getElapsedTime();
	if( K_AUTO_ROTATION && MODE === 'free'){
		// group.rotation.y = elapsedTime * speed;
		// group.rotation.x = elapsedTime * speed;
		// group.rotation.z = elapsedTime * speed;

		_group.rotation.y = elapsedTime * speed;
		_group.rotation.x = elapsedTime * speed;
		_group.rotation.z = elapsedTime * speed;
	
	}

	targetQuat = targetQuat.setFromEuler(_group.rotation)
	group.quaternion.slerp(targetQuat, 0.01);


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


