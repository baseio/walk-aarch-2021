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
import {init_userdraw, clearDrawing, showDrawDemo, hideDrawDemo} from './UserDraw.js'
import {Eraser} from './Eraser.js'
import {GenerateTexture} from './GenerateTexture.js'

import {CircleSprite} from './CircleSpriteTextured.js'
// import {CircleSprite} from './CircleSprite.js'
// import {CircleSprite} from './CircleSpriteCustomShader.js'
// import {CircleSprite} from './CircleSpriteCustomShader-2.js'
// import {AnimCircleSprite} from './AnimCircleSprite.js' // requires gif.js too (in index.html)

import * as DATA from '../../app/data.js'

import {PATHS} from '../../app/data/paths.js'
console.log('PATHS:', PATHS);

import './styles.anim.css'

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

let currentFilter;
let currentThemeFilterValue = ''

// setup

// main
export const initAnimation = (selector) => {
	hideTooltip()
	autoPlay(true) // tween	
	init_userdraw('#userdraw', DRAWING_SIZE, onPathCreated)
	init_scene(selector)
	init_balls()
	update()

	setTimeout( () => {
		randomize()
	}, 10 )

	return this
}

const init_scene = (selector) => {

	window.app.pauseRendering = false
	window.app.userDrawPlaying = false

	window.addEventListener( 'resize', OnWindowResize, false );
	window.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.querySelector(selector).addEventListener('click', onDocumentMouseDown );
	
	clock = new Clock();

	renderer = new WebGLRenderer( { preserveDrawingBuffer: true, antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClearColor = false;
	renderer.domElement.id = 'three'
	document.querySelector(selector).appendChild( renderer.domElement );

	scene = new Scene();
	window.app.scene = scene

	group = new Group();
	group.rotation.set( 0, Math.PI, Math.PI);
	scene.add( group );
	window.app.group = group

	camera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.001, 1000 );
	scene.add( camera );
	camera.position.set(0,0,2)
	camera.lookAt( group.position );
	window.app.camera = camera

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
	window.app.controls = controls

	eraser = new Eraser()
	scene.add( eraser.el );
	window.app.eraser = eraser

	targetQuat = new Quaternion().setFromEuler(group.rotation)
	originQuat = new Quaternion().setFromEuler(group.rotation)

}



const init_balls = () => {
	const normalTexture = GenerateTexture('#eee', '#fff', 10)
	const hoverTexture  = GenerateTexture('#fff', '#000', 20)

	for(let i=0; i<numballs; i++){
		balls.push( new CircleSprite(group, i, DATA.DATA_STUDENTS[i], normalTexture, hoverTexture))
	}

	window.app.balls = balls
}


const randomize = () => {
	// _moveto_random_positions()
	_moveto_random_path()
}
window.randomize = randomize

const _moveto_random_positions = () => {
	console.log('_moveto_random_positions()');

	const maxSpeed = 0.4
	for(let i=0; i<2; i++){
		const s = Math.random() * maxSpeed
		const r = -maxSpeed + s * 2
		speeds[i] = r
	}

	balls.forEach( ball => {
		const tx = -1 + (2*Math.random())
		const ty = -1 + (2*Math.random())
		const tz = -1 + (2*Math.random())
		const to = 1
		const tr = ball.enabledSize
		ball.setTarget({x:tx, y:ty, z:tz, o:to, r:tr})
	})

	clearDrawing()
}

const _moveto_random_path = () => {
	console.log('_moveto_random_path()');

	const pathKeys = Object.keys(PATHS)	

	const index = Math.floor(Math.random() * pathKeys.length )
	const p = PATHS[ pathKeys[index] ]
	console.log('using index', index, 'key:', pathKeys[index], 'p:', p);
	
	const parser = new DOMParser();
	const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="${p}" /></svg>`, 'image/svg+xml');

	const S = 30 // max viewbox	* 1.5
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

// const ____moveto_ransom_path = () => {
// 	console.log('_moveto_ransom_path()');

// 	// from: http://svgicons.sparkk.fr
// 	const paths = [
		
// 		/* star */
// 		`<svg class="svg-icon" viewBox="0 0 20 20">
// 			<path d="M17.684,7.925l-5.131-0.67L10.329,2.57c-0.131-0.275-0.527-0.275-0.658,0L7.447,7.255l-5.131,0.67C2.014,7.964,1.892,8.333,2.113,8.54l3.76,3.568L4.924,17.21c-0.056,0.297,0.261,0.525,0.533,0.379L10,15.109l4.543,2.479c0.273,0.153,0.587-0.089,0.533-0.379l-0.949-5.103l3.76-3.568C18.108,8.333,17.986,7.964,17.684,7.925 M13.481,11.723c-0.089,0.083-0.129,0.205-0.105,0.324l0.848,4.547l-4.047-2.208c-0.055-0.03-0.116-0.045-0.176-0.045s-0.122,0.015-0.176,0.045l-4.047,2.208l0.847-4.547c0.023-0.119-0.016-0.241-0.105-0.324L3.162,8.54L7.74,7.941c0.124-0.016,0.229-0.093,0.282-0.203L10,3.568l1.978,4.17c0.053,0.11,0.158,0.187,0.282,0.203l4.578,0.598L13.481,11.723z"></path>
// 		</svg>`,
		
// 		/* heart */
// 		`<svg class="svg-icon" viewBox="0 0 20 20">
// 			<path d="M9.719,17.073l-6.562-6.51c-0.27-0.268-0.504-0.567-0.696-0.888C1.385,7.89,1.67,5.613,3.155,4.14c0.864-0.856,2.012-1.329,3.233-1.329c1.924,0,3.115,1.12,3.612,1.752c0.499-0.634,1.689-1.752,3.612-1.752c1.221,0,2.369,0.472,3.233,1.329c1.484,1.473,1.771,3.75,0.693,5.537c-0.19,0.32-0.425,0.618-0.695,0.887l-6.562,6.51C10.125,17.229,9.875,17.229,9.719,17.073 M6.388,3.61C5.379,3.61,4.431,4,3.717,4.707C2.495,5.92,2.259,7.794,3.145,9.265c0.158,0.265,0.351,0.51,0.574,0.731L10,16.228l6.281-6.232c0.224-0.221,0.416-0.466,0.573-0.729c0.887-1.472,0.651-3.346-0.571-4.56C15.57,4,14.621,3.61,13.612,3.61c-1.43,0-2.639,0.786-3.268,1.863c-0.154,0.264-0.536,0.264-0.69,0C9.029,4.397,7.82,3.61,6.388,3.61"></path>
// 		</svg>`,

// 		/* airplane */
// 		`<svg class="svg-icon" viewBox="0 0 20 20">
// 			<path d="M17.218,2.268L2.477,8.388C2.13,8.535,2.164,9.05,2.542,9.134L9.33,10.67l1.535,6.787c0.083,0.377,0.602,0.415,0.745,0.065l6.123-14.74C17.866,2.46,17.539,2.134,17.218,2.268 M3.92,8.641l11.772-4.89L9.535,9.909L3.92,8.641z M11.358,16.078l-1.268-5.613l6.157-6.157L11.358,16.078z"></path>
// 		</svg>`,

// 		/* cloud */
// 		`<svg class="svg-icon" viewBox="0 0 20 20">
// 			<path fill="none" d="M16.888,8.614c0.008-0.117,0.018-0.233,0.018-0.352c0-2.851-2.311-5.161-5.16-5.161c-1.984,0-3.705,1.121-4.568,2.763c-0.32-0.116-0.664-0.182-1.023-0.182c-1.663,0-3.011,1.348-3.011,3.01c0,0.217,0.024,0.427,0.067,0.631c-1.537,0.513-2.647,1.96-2.647,3.67c0,2.138,1.733,3.87,3.871,3.87h10.752c2.374,0,4.301-1.925,4.301-4.301C19.486,10.792,18.416,9.273,16.888,8.614 M15.186,16.003H4.433c-1.66,0-3.01-1.351-3.01-3.01c0-1.298,0.827-2.444,2.06-2.854l0.729-0.243l-0.16-0.751C4.02,8.993,4.003,8.841,4.003,8.692c0-1.186,0.965-2.15,2.151-2.15c0.245,0,0.49,0.045,0.729,0.131l0.705,0.256l0.35-0.664c0.748-1.421,2.207-2.303,3.807-2.303c2.371,0,4.301,1.929,4.301,4.301c0,0.075-0.007,0.148-0.012,0.223l-0.005,0.073L15.99,9.163l0.557,0.241c1.263,0.545,2.079,1.785,2.079,3.159C18.626,14.46,17.082,16.003,15.186,16.003"></path>
// 		</svg>`,
		
// 		/* circle */
// 		`<svg class="svg-icon" viewBox="0 0 20 20">
// 			<path fill="none" d="M10,0.562c-5.195,0-9.406,4.211-9.406,9.406c0,5.195,4.211,9.406,9.406,9.406c5.195,0,9.406-4.211,9.406-9.406C19.406,4.774,15.195,0.562,10,0.562 M10,18.521c-4.723,0-8.551-3.829-8.551-8.552S5.277,1.418,10,1.418s8.552,3.828,8.552,8.551S14.723,18.521,10,18.521"></path>
// 		</svg>`,

// 		/* x */
// 		`<svg class="svg-icon" viewBox="0 0 20 20">
// 			<path fill="none" d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"></path>
// 		</svg>`


// 	]
	

// 	const parser = new DOMParser();

// 	const index = Math.floor(Math.random() * paths.length)
// 	// console.log('using index', index);
// 	const newPath = paths[ index ]
// 	const fixedPath = newPath.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg"`)
// 	const doc = parser.parseFromString(fixedPath, 'image/svg+xml');

	
// 	const vb = doc.documentElement.getAttribute('viewBox')
// 	const width  = vb.split(' ')[2] * 1.0
// 	const height = vb.split(' ')[3] * 1.0
// 	const size = Math.max(width, height)
// 	// console.log('viewBox:', vb, 'width:', width, 'height:', height, 'size:', size );	

// 	const S = size + (size/2) // 30 // DRAWING_SIZE
	
// 	const path = doc.querySelector('path')
// 	const length = path.getTotalLength()
// 	const inc = length / numballs
// 	const positions = []
// 	for(let i=0; i<numballs; i++){	
// 		const p = path.getPointAtLength( inc * i)
// 		const x = -1 + (2* (p.x / S ))
// 		const y = -1 + (2* (p.y / S ))
// 		const z = 0
// 		// console.log(p.x, p.y, x, y);
// 		positions.push({x,y,z})
// 	}
	
// 	applyPositions(positions)
// }


// loop

let speeds = [
	0.1 + (Math.random() * 0.4),
	0.1 + (Math.random() * 0.4),
	0.1 + (Math.random() * 0.4)
]

const update = () => {
	requestAnimationFrame(update)

	window.app.mode = MODE

	if( window.app.pauseRendering ) return

	balls.forEach( b => b.update() )

	eraser.update()
	controls.update()
	// console.log(eraser.material.opacity);

	const speed = 0.33 //0.5

	const elapsedTime = clock.getElapsedTime();
	if( K_AUTO_ROTATION && MODE === 'free'){
		group.rotation.y = elapsedTime * speeds[0];
		group.rotation.x = elapsedTime * speeds[1];
		group.rotation.z = elapsedTime * speeds[2];
	
	}

	targetQuat = targetQuat.setFromEuler(group.rotation)
	group.quaternion.slerp(targetQuat, 0.01);

	if( MODE === 'grid') {
		eraser.material.transparent = false
	}

	renderer.render( scene, camera );

	// setTooltipOrigin()
}


// tooltip

const hideTooltip = () => {
	const el = document.querySelector('#tooltip')
	if( el ){
		el.style.display = 'none'
	}
}

const showTooltip = ( pos, label='' ) => {

	const el = document.querySelector('#tooltip')
	if( !el ) return

	if( pos === null ){
		el.style.display = 'none'
		return
	}else{
		el.style.display = 'block'
	}


 	const canvasHalfWidth  = ( renderer.domElement.width / window.devicePixelRatio )  / 2;
 	const canvasHalfHeight = ( renderer.domElement.height / window.devicePixelRatio )  / 2;
 	
    const point = pos.clone().project(camera);
    point.x =  (point.x * canvasHalfWidth)  + canvasHalfWidth  + renderer.domElement.offsetLeft;
    point.y =  (point.y * canvasHalfHeight) + canvasHalfHeight + renderer.domElement.offsetTop;

    point.y -= 14
  
  	el.style.transform = 'translate(' + point.x + 'px, ' + point.y + 'px)';
  	el.innerHTML = label
}

// events

const OnWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// called by user-draw
// distribute balls evenly along the path
const onPathCreated = (path /* svg */, clearTrails=true) => {	

	// console.log('onPathCreated:', path);
	console.log('onPathCreated: mode:', MODE);
	// if( clearTrails ) eraser.clearScreen()

	const length = path.getTotalLength()
	const inc = length / numballs
	const positions = []
	for(let i=0; i<numballs; i++){	
		const p = path.getPointAtLength( inc * i)
		const x = -1 + (2* (p.x / DRAWING_SIZE ))
		const y = -1 + (2* (p.y / DRAWING_SIZE ))
		const z = 0
		positions.push({x,y,z})
	}
	
	if( clearTrails ){
		// normal
		applyPositions(positions)
	}else{
		applyPositions(positions,null,null,0.0001,false)
	}
	
	if( MODE != 'free' ){
		window.location.hash = ''		
	}
}

// set ball positions to provided array
const applyPositions = (positions, blendMax=null, blendMin=null, hideTrailsFor=100, clearTrails=true) => {

	if( clearTrails ) eraser.clearScreen()

	let delay = 0
	for(let i=0; i<numballs; i++){
		delay = i * 10
		setTimeout( () => {
			balls[i].setTarget( positions[i] )
		}, delay)			
	}

	setTimeout( () => {
		// console.log('applyPositions reveal trails');
		eraser.blendDown(blendMin)
	}, delay + hideTrailsFor)
}

export const getMode = () => {
	return MODE
}


// filters


export const setFilter = (key) => {
	currentFilter = key
}

export const applyFilter = (key, val) => {
	// we want to be able to filter on a theme AND search for a NAME at the same time
	// console.log('#A Animation applyFilter', key, val);

	eraser.clearScreen()
	
	if( key ){
		currentFilter = key
	}


	if( currentFilter === 'all' ){
		return;
	}

	if( currentFilter === 'theme' ){
		currentThemeFilterValue = val
		// const t = DATA.THEMES_EN.filter(t => t.id === val)[0]

		console.log('applyFilter', key, val);

		balls.forEach( ball => {
			if( val === false || ball.el.userData.data.theme === currentThemeFilterValue ){
				ball.setEnabled(true)
			}else{
				ball.setEnabled(false)
			}
		})

		if( val ){
			window.toGrid()
		}else{
			window.toFree()
		}
	}

	if( currentFilter === 'student' ){
		console.log('applyFilter STUD', key, val);
		if( val === '') return

		const lcval = val.toLowerCase()
		balls.forEach( ball => {
			let name = ball.el.userData.data.name.toLowerCase()

			if( name.indexOf( lcval ) > -1 ){
				console.log('matching ', val, lcval, name);
				ball.setEnabled(true)
			}else{
				ball.setEnabled(false)
			}
		})
	}
}

// layouts

// release focus/grid to normal drawing mode
window.toFree = () => {
	
	if( MODE === 'free' ){
		console.log('toFree: Allready in free - aborting');
		return false
	}
	console.log('toFree');

	window.app.pauseRendering = false
	window.app.actions.hide_render_student()
	window.app.actions.clear_theme()
	window.app.actions.clearThemeSelection()
	window.app.actions.clearFeatSelection()

	controls.enableRotate  = true;
	controls.enableDamping = true;
	MODE = 'free'


	balls.forEach( ball => {
		ball.normal()
	})

	randomize()
}


let focusedNode = null

// brings one node to front
window.toNode = (id) => {
	// console.log('toNode: focusedNode:', focusedNode.?i, id);
	if( MODE === 'node'){
		if( focusedNode != null ){
			if( focusedNode.i === id){
				console.log('toNode: Allready at node - aborting');
				return false
			}
		}
	}
	MODE = 'node'
	focusedNode = balls[id]

	console.log('toNode', id, focusedNode);

	balls.forEach( ball => {
		if( ball.i != focusedNode.i ){
			// ball.r = ball.disabledSize
			ball.hide()
		}
	})
	
	focusedNode.focus()

	hideTooltip()
	
	window.app.actions.render_student(focusedNode.el.userData.data.stub)

	setTimeout( () => {
		window.app.pauseRendering = true
	}, 1000 )

	return true
}


// arrange balls in a 2d grid
window.toGrid = () => {
	if( MODE === 'grid' ){
		console.log('toNode: Allready in grid - aborting');
		return false
	}
	console.log('toNode')

	MODE = 'grid'
	window.app.pauseRendering = false
	window.app.actions.hide_render_student()
	
	controls.enableRotate  = false;
	controls.enableDamping = false;
	controls.reset()

	group.rotation.set( 0, Math.PI, Math.PI);

	camera.position.set(0,0,2)

	//

	// camera.lookAt( group.position );

	//

	const scale = 0.1
	const cols = Math.ceil( Math.sqrt(numballs))

	let y = -(cols / 2) * scale
	let sx = -(cols / 2) * scale
	const positions = []
	for(let i=0; i<numballs; i++){	
		let x = sx + ( i % cols ) * scale
		if( i % cols === 0 ) y += scale
		
		positions.push({x,y,z:0})
	}
	applyPositions(positions, 1, null, 4000)
}


// interactions

let selectedObject = null;
let selectedBall = null;
let previousSelectedObjectId = null
const raycaster = new Raycaster();
const mouseVector = new Vector3();

let intersectedBall = null // new

const onDocumentMouseDown = () => {

	// todo
	// look at current hash
	// if its a student -> go to her theme (grid)
	// if its a theme   -> go to selectedNode (sat by mouseMove)

	console.log('onDocumentMouseDown', MODE, previousSelectedObjectId);
	if( previousSelectedObjectId ){

		if( MODE === 'node' ){
			// collapse
			const b = balls[ previousSelectedObjectId ]
			console.log('un-focus node',  focusedNode );
			if( focusedNode ){
				focusedNode.normal()
				focusedNode = null
			}
			console.log('@anim onDocumentMouseDown collapse', currentFilter, currentThemeFilterValue, b);

			const theme = DATA.THEMES.filter(t => t.id === b.el.userData.data.theme)[0]

			window.location.hash = `#theme:${theme.slug}`

		}else{
			// focus
			console.log('@anim onDocumentMouseDown focus', DATA.DATA_STUDENTS[previousSelectedObjectId].name );
			window.location.hash = '#'+ DATA.DATA_STUDENTS[previousSelectedObjectId].stub
		}

	}else{
	 	// if( MODE != 'free') toFree()
	}
}

function onDocumentMouseMove( event ) {

	// console.log('@@', MODE, renderer.domElement.id);
	
	if( MODE != 'grid' ){
		hideTooltip()
		return
	}

	if( event.target.id != renderer.domElement.id ) return

	event.preventDefault();
	
	// if ( selectedObject ) {		
	// 	// selectedObject.material.color.set( '#fff' );
	// 	selectedObject.unhover()
	// 	selectedObject = null;
	// }

	if( selectedBall ){
		// console.log('selectedBall:', selectedBall);
		selectedBall.unhover()
		selectedBall = null;
		hideTooltip()
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
					window.app.actions.setStudentSelected( data.data )
					if( document.querySelectorAll('#sidebar [data-key="students"].selected').length ){
						window.app.actions.render_students('')
					}
				}
				previousSelectedObjectId = data.i
				selectedBall = ball
				ball.hover()
				//
				showTooltip( ball.el.position, data.data.name )
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

function getIntersects( x, y ) {

	x = ( x / window.innerWidth ) * 2 - 1;
	y = - ( y / window.innerHeight ) * 2 + 1;

	mouseVector.set( x, y, 0.5 );
	raycaster.setFromCamera( mouseVector, camera );

	return raycaster.intersectObject( group, true );

}


