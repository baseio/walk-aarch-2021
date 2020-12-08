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
let K_AUTO_ROTATION 	= true

// props

let balls = []
let numballs = DATA.DATA_STUDENTS.length || 20


let FOV = 50 //130 //190

let camera, renderer, scene
let controls, clock, group
let eraser

let generated_texture
let targetQuat, originQuat
let cameraTarget

let currentFilter;
let currentThemeFilterValue = ''

let MODE = 'free'



export const initAnimation = (selector) => {
	autoPlay(true) // tween
	
	init_userdraw('#userdraw', DRAWING_SIZE, onPathCreated)
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

	eraser.upDown()
	
}

const init_scene = (selector) => {

	generated_texture = GenerateTexture()

	window.addEventListener( 'resize', OnWindowResize, false );
	window.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.querySelector(selector).addEventListener('click', onDocumentMouseDown );

	
	renderer = new WebGLRenderer( { preserveDrawingBuffer: true, antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClearColor = false;
	renderer.domElement.id = 'three'
	document.querySelector(selector).appendChild( renderer.domElement );

	clock = new Clock();

	scene = new Scene();
	scene.background = '#ff0000'
	cameraTarget = scene.position

	group = new Group();
	group.rotation.set( 0, Math.PI, Math.PI);
	scene.add( group );

	camera = new PerspectiveCamera( 190, window.innerWidth / window.innerHeight, 0.001, 10 );

	let dist = 1 / 2 / Math.tan(Math.PI * FOV / 360);
	dist += 0.4

	const cameraTween = new Tween({z:10, fov:camera.fov}).to({z:dist, fov:FOV}, 5000)
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
	scene.add( eraser.el );
	eraser.blendDown()
}

const OnWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


const onPathCreated = (path /* svg */) => {
	eraser.blendUp()

	const length = path.getTotalLength()
	const inc = length / numballs

	MODE = 'free'

	let delay = 0
	for(let i=0; i<numballs; i++){	
		const p = path.getPointAtLength( inc * i)
		const sx = -1 + (2* (p.x / DRAWING_SIZE ))
		const sy = -1 + (2* (p.y / DRAWING_SIZE ))

		delay = i * 10
		setTimeout( () => {
			balls[i].setTarget(sx, sy, 0)
		}, delay)
	}

	setTimeout( () => {
		eraser.blendDown()
	}, delay + 1000)
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


const init_balls = () => {
	for(let i=0; i<numballs; i++){
		balls.push( new CircleSprite(group, i, generated_texture))
	}

	window.app.balls = balls
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

	x = ( x / window.innerWidth ) * 2 - 1;
	y = - ( y / window.innerHeight ) * 2 + 1;

	mouseVector.set( x, y, 0.5 );
	raycaster.setFromCamera( mouseVector, camera );

	return raycaster.intersectObject( group, true );

}


