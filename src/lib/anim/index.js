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

import {CircleSprite} from './CircleSprite.js'
// import {CircleSprite} from './CircleSpriteCustomShader.js'
// import {CircleSprite} from './CircleSpriteCustomShader-2.js'
// import {AnimCircleSprite} from './AnimCircleSprite.js' // requires gif.js too (in index.html)

import * as DATA from '../../app/data.js'

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

	// projector = new Projector();

	eraser = new Eraser()
	scene.add( eraser.el );
	window.app.eraser = eraser

	targetQuat = new Quaternion().setFromEuler(group.rotation)
	originQuat = new Quaternion().setFromEuler(group.rotation)

	/*
	const cameraTween = new Tween({z:-10, fov:camera.fov}).to({z:2, fov:FOV}, 2000)
		.easing( Easing.Sinusoidal.InOut )
		.on('update', (o) => {
			if( MODE != 'grid') {
	   			camera.position.set(0,0,o.z)
	   			// camera.fov = o.fov
	   			camera.updateProjectionMatrix();
	   		}
 		})
 		.start()
	*/ 		

	
	// eraser.blendDown()
	// eraser.blendUp()
	// eraser.material.opacity = 1

	// window.app.eraser.material.opacity = 1
	// window.app.eraser.to = 0.001
}



const init_balls = () => {
	const normalTexture = GenerateTexture('#eee', '#fff', 10)
	const hoverTexture  = GenerateTexture('#fff', '#000', 20)

	// numballs = 1
	// for(let i=0; i<1; i++){
	for(let i=0; i<numballs; i++){
		balls.push( new CircleSprite(group, i, DATA.DATA_STUDENTS[i], normalTexture, hoverTexture))
		// balls.push( new AnimCircleSprite(group, i, DATA.DATA_STUDENTS[i], normalTexture, hoverTexture))
	}
	window.app.balls = balls
}

const randomize = () => {
	// console.log('randomize()');

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
 	// var canvasHalfWidth  = renderer.domElement.offsetWidth  / 2;
    // var canvasHalfHeight = renderer.domElement.offsetHeight / 2;

    var point = pos.clone().project(camera);
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
const onPathCreated = (path /* svg */) => {	

	console.log('onPathCreated');
	eraser.clearScreen()

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
	applyPositions(positions)
	// window.toFree()
	window.location.hash = ''
}

// set ball positions to provided array
const applyPositions = (positions, blendMax=null, blendMin=null, hideTrailsFor=100) => {

	eraser.clearScreen()

	let delay = 0
	for(let i=0; i<numballs; i++){
		delay = i * 10
		setTimeout( () => {
			balls[i].setTarget( positions[i] )
		}, delay)			
	}

	setTimeout( () => {
		console.log('applyPositions reveal trails');
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
	console.log('toFree');
	
	if( MODE === 'free' ){
		console.log('toFree: Allready in free - aborting');
		return false
	}

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
	if( MODE === 'node' ){
		console.log('toNode: Allready at node - aborting');
		return false
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
	MODE = 'grid'
	window.app.pauseRendering = false
	window.app.actions.hide_render_student()
	
	controls.enableRotate  = false;
	controls.enableDamping = false;
	controls.reset()

	group.rotation.set( 0, Math.PI, Math.PI);

	camera.position.set(0,0,2)

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
	
	if( MODE != 'grid' ) return
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


