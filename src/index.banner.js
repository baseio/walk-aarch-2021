/*! 

 *******************************************************************************
 * Hi!                                                                         *
 * Drop js@dearstudio.dk an email if you want access to the un-minified source *
 * (CC BY-NC-SA 4.0)                                                           *
 *******************************************************************************
 
*/

import {settings} from './app/settings.js'

import {
	WebGLRenderer,
	Scene,
	Clock,
	Color,
	Group,
	PerspectiveCamera,
	Raycaster,
	Vector3,
	Quaternion
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN, { Tween, Easing, Interpolation, autoPlay } from 'es6-tween';

import {Eraser} from './lib/anim/Eraser.js'
import {GenerateTexture} from './lib/anim/GenerateTexture.js'

// import {CircleSprite} from './lib/anim/CircleSprite.js'
import {CircleSprite} from './lib/anim/CircleSpriteB64Textured.js'

import * as DATA from './app/data.js'

import './lib/anim/styles.banner.css'

import {checkWebGL} from './app/fallback.js'

// config
const DRAWING_SIZE = 200 // size of the userdraw canvas

// flags
let MODE = 'free'
let K_AUTO_ROTATION = true

// props
let balls = []
let numballs = DATA.DATA_STUDENTS.length || 20

let FOV = 50 //130 //190

let camera, renderer, scene
let controls, clock, group
let eraser

let targetQuat, originQuat

let demoIndex = 0
let timeout = null

let speeds = [
	0.1 + (Math.random() * 0.4),
	0.1 + (Math.random() * 0.4),
	0.1 + (Math.random() * 0.4)
]

const TITLEB64 = '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'

// main
const initAnimation = (selector) => {
	
	// document.querySelector('#logo').innerHTML = settings.title
	// document.querySelector('#title').style.backgroundImage = 'url(title.png)'
	document.querySelector('#title').style.backgroundImage = `url(data:image/png;base64,${TITLEB64})`

	autoPlay(true) // tween	
	
	init_scene(selector)
	init_balls()
	update()

	// setTimeout( () => {
	// 	randomize()
	// }, 10 )

	timeout = setInterval( () => {
		randomize()
	}, 14000 )
	
	randomize()
}

const init_scene = (selector) => {

	window.app = {mode: 'free'}

	window.addEventListener( 'resize', OnWindowResize, false );

	document.querySelector(selector).addEventListener('click', randomize );
	document.querySelector(selector).addEventListener('touchend', randomize );
	
	clock = new Clock();

	renderer = new WebGLRenderer( { preserveDrawingBuffer: true, antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClearColor = false;
	renderer.domElement.id = 'three'
	document.querySelector(selector).appendChild( renderer.domElement );

	scene = new Scene();
	
	group = new Group();
	group.rotation.set( 0, Math.PI, Math.PI);
	scene.add( group );

	camera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.001, 1000 );
	scene.add( camera );
	camera.position.set(0,0,2)
	camera.lookAt( group.position );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableRotate = true;
	controls.enableDamping = true;
	controls.dampingFactor = 0.02;
	// controls.minDistance = 10;
	// controls.maxDistance = 100;
	// controls.maxPolarAngle = Math.PI * 0.5;
	// controls.saveState()
	controls.update()
	controls.saveState()

	eraser = new Eraser()
	scene.add( eraser.el );

	targetQuat = new Quaternion().setFromEuler(group.rotation)
	originQuat = new Quaternion().setFromEuler(group.rotation)

}



const init_balls = () => {
	const normalTexture = GenerateTexture('#eee', '#fff', 10)
	const hoverTexture  = GenerateTexture('#fff', '#000', 20)

	for(let i=0; i<numballs; i++){
		balls.push( new CircleSprite(group, i, DATA.DATA_STUDENTS[i], normalTexture, hoverTexture))
	}

}


const randomize = () => {
	// _moveto_random_positions()
	_moveto_ransom_path()

	// speeds = [
	// 	0.1 + (Math.random() * 0.4),
	// 	0.1 + (Math.random() * 0.4),
	// 	0.1 + (Math.random() * 0.4)
	// ]
}
window.randomize = randomize

// const _moveto_random_positions = () => {
// 	console.log('_moveto_random_positions()');

// 	const maxSpeed = 0.4
// 	for(let i=0; i<2; i++){
// 		const s = Math.random() * maxSpeed
// 		const r = -maxSpeed + s * 2
// 		speeds[i] = r
// 	}

// 	balls.forEach( ball => {
// 		const tx = -1 + (2*Math.random())
// 		const ty = -1 + (2*Math.random())
// 		const tz = -1 + (2*Math.random())
// 		const to = 1
// 		const tr = ball.enabledSize
// 		ball.setTarget({x:tx, y:ty, z:tz, o:to, r:tr})
// 	})

// 	clearDrawing()
// }

const _moveto_random_positions = () => {
	console.log('_moveto_random_positions()');

	// const maxSpeed = 0.4
	// for(let i=0; i<2; i++){
	// 	const s = Math.random() * maxSpeed
	// 	const r = -maxSpeed + s * 2
	// 	speeds[i] = r
	// }

	// balls.forEach( ball => {
	// 	const tx = -1 + (2*Math.random())
	// 	const ty = -1 + (2*Math.random())
	// 	const tz = -1 + (2*Math.random())
	// 	const to = 1
	// 	const tr = ball.enabledSize
	// 	ball.setTarget({x:tx, y:ty, z:tz, o:to, r:tr})
	// })

	// clearDrawing()

	const positions = []
	for(let i=0; i<numballs; i++){	
		const tx = -1 + (2*Math.random())
		const ty = -1 + (2*Math.random())
		const tz = -1 + (2*Math.random())
		// const to = 1
		positions.push({x:tx, y:ty, z:tz})
	}
	
	applyPositions(positions)
}

const _moveto_ransom_path = () => {
	console.log('_moveto_ransom_path()');

	// from: http://svgicons.sparkk.fr
	const paths = [
		
		/* star */
		`<svg class="svg-icon" viewBox="0 0 20 20">
			<path d="M17.684,7.925l-5.131-0.67L10.329,2.57c-0.131-0.275-0.527-0.275-0.658,0L7.447,7.255l-5.131,0.67C2.014,7.964,1.892,8.333,2.113,8.54l3.76,3.568L4.924,17.21c-0.056,0.297,0.261,0.525,0.533,0.379L10,15.109l4.543,2.479c0.273,0.153,0.587-0.089,0.533-0.379l-0.949-5.103l3.76-3.568C18.108,8.333,17.986,7.964,17.684,7.925 M13.481,11.723c-0.089,0.083-0.129,0.205-0.105,0.324l0.848,4.547l-4.047-2.208c-0.055-0.03-0.116-0.045-0.176-0.045s-0.122,0.015-0.176,0.045l-4.047,2.208l0.847-4.547c0.023-0.119-0.016-0.241-0.105-0.324L3.162,8.54L7.74,7.941c0.124-0.016,0.229-0.093,0.282-0.203L10,3.568l1.978,4.17c0.053,0.11,0.158,0.187,0.282,0.203l4.578,0.598L13.481,11.723z"></path>
		</svg>`,
		
		/* heart */
		`<svg class="svg-icon" viewBox="0 0 20 20">
			<path d="M9.719,17.073l-6.562-6.51c-0.27-0.268-0.504-0.567-0.696-0.888C1.385,7.89,1.67,5.613,3.155,4.14c0.864-0.856,2.012-1.329,3.233-1.329c1.924,0,3.115,1.12,3.612,1.752c0.499-0.634,1.689-1.752,3.612-1.752c1.221,0,2.369,0.472,3.233,1.329c1.484,1.473,1.771,3.75,0.693,5.537c-0.19,0.32-0.425,0.618-0.695,0.887l-6.562,6.51C10.125,17.229,9.875,17.229,9.719,17.073 M6.388,3.61C5.379,3.61,4.431,4,3.717,4.707C2.495,5.92,2.259,7.794,3.145,9.265c0.158,0.265,0.351,0.51,0.574,0.731L10,16.228l6.281-6.232c0.224-0.221,0.416-0.466,0.573-0.729c0.887-1.472,0.651-3.346-0.571-4.56C15.57,4,14.621,3.61,13.612,3.61c-1.43,0-2.639,0.786-3.268,1.863c-0.154,0.264-0.536,0.264-0.69,0C9.029,4.397,7.82,3.61,6.388,3.61"></path>
		</svg>`,

		/* airplane */
		`<svg class="svg-icon" viewBox="0 0 20 20">
			<path d="M17.218,2.268L2.477,8.388C2.13,8.535,2.164,9.05,2.542,9.134L9.33,10.67l1.535,6.787c0.083,0.377,0.602,0.415,0.745,0.065l6.123-14.74C17.866,2.46,17.539,2.134,17.218,2.268 M3.92,8.641l11.772-4.89L9.535,9.909L3.92,8.641z M11.358,16.078l-1.268-5.613l6.157-6.157L11.358,16.078z"></path>
		</svg>`,

		/* cloud */
		`<svg class="svg-icon" viewBox="0 0 20 20">
			<path fill="none" d="M16.888,8.614c0.008-0.117,0.018-0.233,0.018-0.352c0-2.851-2.311-5.161-5.16-5.161c-1.984,0-3.705,1.121-4.568,2.763c-0.32-0.116-0.664-0.182-1.023-0.182c-1.663,0-3.011,1.348-3.011,3.01c0,0.217,0.024,0.427,0.067,0.631c-1.537,0.513-2.647,1.96-2.647,3.67c0,2.138,1.733,3.87,3.871,3.87h10.752c2.374,0,4.301-1.925,4.301-4.301C19.486,10.792,18.416,9.273,16.888,8.614 M15.186,16.003H4.433c-1.66,0-3.01-1.351-3.01-3.01c0-1.298,0.827-2.444,2.06-2.854l0.729-0.243l-0.16-0.751C4.02,8.993,4.003,8.841,4.003,8.692c0-1.186,0.965-2.15,2.151-2.15c0.245,0,0.49,0.045,0.729,0.131l0.705,0.256l0.35-0.664c0.748-1.421,2.207-2.303,3.807-2.303c2.371,0,4.301,1.929,4.301,4.301c0,0.075-0.007,0.148-0.012,0.223l-0.005,0.073L15.99,9.163l0.557,0.241c1.263,0.545,2.079,1.785,2.079,3.159C18.626,14.46,17.082,16.003,15.186,16.003"></path>
		</svg>`,
		
		/* circle */
		`<svg class="svg-icon" viewBox="0 0 20 20">
			<path fill="none" d="M10,0.562c-5.195,0-9.406,4.211-9.406,9.406c0,5.195,4.211,9.406,9.406,9.406c5.195,0,9.406-4.211,9.406-9.406C19.406,4.774,15.195,0.562,10,0.562 M10,18.521c-4.723,0-8.551-3.829-8.551-8.552S5.277,1.418,10,1.418s8.552,3.828,8.552,8.551S14.723,18.521,10,18.521"></path>
		</svg>`,

		/* x */
		`<svg class="svg-icon" viewBox="0 0 20 20">
			<path fill="none" d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"></path>
		</svg>`


	]
	

	const parser = new DOMParser();

	const index = Math.floor(Math.random() * paths.length)
	console.log('using index', index);
	const newPath = paths[ index ]
	const fixedPath = newPath.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg"`)
	const doc = parser.parseFromString(fixedPath, 'image/svg+xml');

	
	const vb = doc.documentElement.getAttribute('viewBox')
	const width  = vb.split(' ')[2] * 1.0
	const height = vb.split(' ')[3] * 1.0
	const size = Math.max(width, height)
	console.log('viewBox:', vb, 'width:', width, 'height:', height, 'size:', size );	

	const S = size // + (size/2) // 30 // DRAWING_SIZE
	
	const path = doc.querySelector('path')
	const length = path.getTotalLength()
	const inc = length / numballs
	const positions = []
	for(let i=0; i<numballs; i++){	
		const p = path.getPointAtLength( inc * i)
		const x = -1 + (2* (p.x / S ))
		const y = -1 + (2* (p.y / S ))
		const z = 0
		// console.log(p.x, p.y, x, y);
		positions.push({x,y,z})
	}
	
	applyPositions(positions)
}


const applyPositions = (positions, blendMax=null, blendMin=null, hideTrailsFor=100, clearTrails=true) => {

	if( clearTrails ) eraser.clearScreen()

	let delay = 0

	for(let i=0; i<numballs; i++){
		delay = i * 10
		setTimeout( () => {
			balls[i].setTarget( {x:0, y:0, z:0} )
			setTimeout( () => {
				balls[i].setTarget( positions[i] )
			}, 100)
		}, delay)			
	}

	setTimeout( () => {
		eraser.blendDown(blendMin)
	}, delay + hideTrailsFor)

	/*
	for(let i=0; i<numballs; i++){
		delay = i * 10
		setTimeout( () => {
			balls[i].setTarget( {x:0, y:0, z:0} )
		}, delay)			
	}


	setTimeout( () => {
		delay = 0
		for(let i=0; i<numballs; i++){
			delay = i * 10
			setTimeout( () => {
				balls[i].setTarget( positions[i] )
			}, delay)			
		}


	}, delay - 100 );

	*/
}




// loop



const update = () => {
	requestAnimationFrame(update)

	balls.forEach( b => b.update() )

	eraser.update()
	controls.update()

	const speed = 0.33 //0.5

	const elapsedTime = clock.getElapsedTime();

	group.rotation.y = elapsedTime * speeds[0];
	group.rotation.x = elapsedTime * speeds[1];
	group.rotation.z = elapsedTime * speeds[2];
	
	targetQuat = targetQuat.setFromEuler(group.rotation)
	group.quaternion.slerp(targetQuat, 0.01);


	renderer.render( scene, camera );
}


// events

const OnWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// begin

if( checkWebGL() ){
	initAnimation('#animation')
}