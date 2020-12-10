import {
	WebGLRenderer,
	Scene,
	Clock,
	Color,
	Group,
	PerspectiveCamera,
	Raycaster,
	Vector3,
	Quaternion,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN, { Tween, Easing, Interpolation, autoPlay } from 'es6-tween';
import {init_userdraw, showDrawDemo, hideDrawDemo} from './UserDraw.js'
import {CircleSprite} from './CircleSprite.js'
import {Eraser} from './Eraser.js'
import {GenerateTexture} from './GenerateTexture.js'
import * as DATA from '../data.js'
import './styles.anim.css'

// config
const DRAWING_SIZE = 200 // size of the userdraw canvas

// flags
let MODE = 'free'
let K_AUTO_ROTATION 	= true

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
	autoPlay(true) // tween
	
	init_userdraw('#userdraw', DRAWING_SIZE, onPathCreated)
	init_scene(selector)
	init_balls()
	update()	

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

	for(let i=0; i<numballs; i++){
		balls.push( new CircleSprite(group, i, normalTexture, hoverTexture))
	}
	window.app.balls = balls
}

// loop

let speeds = [
	0.1 + (Math.random() * 0.4),
	0.1 + (Math.random() * 0.4),
	0.1 + (Math.random() * 0.4)
]

const update = () => {
	requestAnimationFrame(update)

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
	window.toFree()
}

// set ball positions to provided array
const applyPositions = (positions, blendMax=null, blendMin=null, hideTrailsFor=100) => {
	// console.log('# applyPositions', 'blendMax:', blendMax, 'blendMin:', blendMin);

	// eraser.material.opacity = 1
	// renderer.render( scene, camera );
	// eraser.blendUp(blendMax)

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



const reset_rotations = () => {
	controls.enableRotate  = false;
	controls.enableDamping = false;
	controls.reset()

	group.rotation.set( 0, Math.PI, Math.PI);
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

	}

	// eraser.upDown()
	
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
	window.app.actions.action('clearThemeSelection')
	window.app.actions.action('clearFeatSelection')

	controls.enableRotate  = true;
	controls.enableDamping = true;
	MODE = 'free'

	balls.forEach( ball => {
		ball.normal()
	})
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

	//reset_rotations()

	balls.forEach( ball => {
		if( ball.i != focusedNode.i ){
			// ball.r = ball.disabledSize
			ball.hide()
		}
	})
	
	// focusedNode.material.color.set( '#09f' );
	// focusedNode.tr = 10 // big enough to cover screen
	// focusedNode.setTarget(0, 0, 0)
	// focusedNode.setTarget(0, 0, -0.25)
	focusedNode.focus()
	
	window.app.actions.render_student(focusedNode.el.userData.data.stub)

	setTimeout( () => {
		window.app.pauseRendering = true
	}, 1000 )



	/*
	let dist = 1 / 2 / Math.tan(Math.PI * camera.fov / 360);
	dist += 0.1 // fits in screen
	
	// dist = 0.5 // fills screen
	camera.position.set(0,0,dist)

	console.log('dist', dist);
	*/

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
	
	// eraser.upDown(1500)
	// eraser.blendUp()
	
	// reset_rotations()
	controls.enableRotate  = false;
	controls.enableDamping = false;
	controls.reset()

	group.rotation.set( 0, Math.PI, Math.PI);

	camera.position.set(0,0,2)
	// camera.fov = FOV
	// camera.updateProjectionMatrix();

	// const cameraTween = new Tween({z:camera.position.z, fov:camera.fov}).to({z:2, fov:FOV}, 1000)
	// 	.easing( Easing.Sinusoidal.InOut )
	// 	.on('update', (o) => {
	// 		// if( MODE != 'grid') {
	//    			camera.position.set(0,0,o.z)
	//    			camera.fov = o.fov
	//    			camera.updateProjectionMatrix();
	//    		// }
 // 		})
 // 		.start()

		
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

const onDocumentMouseDown = () => {
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
			applyFilter(currentFilter, currentThemeFilterValue)
			window.toGrid()			

		}else{
			// focus
			console.log('focus node', DATA.DATA_STUDENTS[previousSelectedObjectId].name );
			window.location.href = '#'+ DATA.DATA_STUDENTS[previousSelectedObjectId].stub

			window.toNode( previousSelectedObjectId )
		}

	}else{
	 	if( MODE != 'free') toFree()
	}
}

function onDocumentMouseMove( event ) {
	
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


