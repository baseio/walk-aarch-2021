
import {injectScript, injectCSS} from '../utils.js'

import * as THREE from '../../vendor/three.module.js';
import { OrbitControls } from '../../vendor/OrbitControls.js';

const USERDRAW_SELECTOR = 'userdraw'

export const initAnimation = (selector) => {

	injectCSS('lib/anim/styles.anim.css')

	// todo: migrate to ESM
	injectScript('vendor/fabric.min.js', () => {
		// console.log('fabric loaded');
		injectScript('vendor/tween.umd.js', () => {
			// console.log('tween loaded');

			init_userdraw()
			init_scene(selector)
			init_balls()
			update()
			// jaggedCamera()
		})
	})


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

const K_TRAILS_ENABLED 	= true
const K_AUTO_ROTATION 	= true
const K_JAGGED_ROTATION	= false
const K_ERASER_OPACITY 	= 0.01

const init_scene = (selector) => {

	window.addEventListener( 'resize', OnWindowResize, false );
	// window.addEventListener( 'mousemove', onDocumentMouseMove, false );

	if( K_TRAILS_ENABLED ){
		renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true, antialias: true } );
	}else{
		renderer = new THREE.WebGLRenderer( { antialias: true } );
	}

	renderer.autoClearColor = '#00ffff';	
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, window.innerHeight );
	renderer.domElement.id = 'three'
	document.querySelector(selector).appendChild( renderer.domElement );

	clock = new THREE.Clock();

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x00ffff );

	group = new THREE.Group();
	group.rotation.set( 0, Math.PI, Math.PI);
	scene.add( group );

	camera = new THREE.PerspectiveCamera( 50, width / window.innerHeight, 0.1, 10 );
	camera.position.set( 0, 0, 2 );
	camera.lookAt( scene.position );
	scene.add( camera );


	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableRotate = true;
	controls.enableDamping = true;
	controls.dampingFactor = 0.02;
	controls.saveState()

	eraserMaterial = new THREE.SpriteMaterial( { color: '#00ffff', transparent: true, opacity:1 } )
	var eraser = new THREE.Sprite( eraserMaterial );
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

	renderer.render( scene, camera );
}

const OnWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}



const init_userdraw = () => {
	var lastPath = null
	var canvas = new fabric.Canvas(USERDRAW_SELECTOR)
	canvas.backgroundColor = '#efefef';
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
	new TWEEN.Tween(source)
		.to(orient, 1000, TWEEN.Easing.Quadratic.InOut)
		.onUpdate( (o) => {
			if( K_JAGGED_ROTATION ){
	   			group.rotation.x = o.x
	   			group.rotation.y = o.y
	   			group.rotation.z = o.z
	   		}
   			
 		})
		.onComplete( (o) => {
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

	new TWEEN.Tween({z:group.position.z})
		.to({z:z}, 1000, TWEEN.Easing.Quadratic.InOut)
		.onUpdate( (o) => {
   			group.position.z = o.z   			
 		})
		.start()
}


let MODE = 'free'
window.toGrid = () => {
	

	MODE = 'grid'
	// eraserMaterial.opacity = 1
	setTimeout( () => {
		// eraserMaterial.opacity = K_ERASER_OPACITY
	}, 100)

	controls.enableRotate  = false;
	controls.enableDamping = false;
	controls.reset()

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
let numballs = 70

const init_balls = () => {
	// const parent = document.querySelector('#left')
	for(let i=0; i<numballs; i++){
		balls.push( new Ball(group, i))
	}
}



class Ball {
	constructor(parent, i){
		this.i = i

		this.x = 0
		this.y = 0
		this.z = -0.25
		this.r = 0.3 //0.1
		
		this.tx = -1 + (2*Math.random())
		this.ty = -1 + (2*Math.random())
		this.tz = Math.random() //* drawingSize
		this.tr = 0.1 //Math.random() //* 50

		const textureLoader = new THREE.TextureLoader();
		const map = textureLoader.load( "./circle-0.png" );
		// const map = textureLoader.load( "circle-0.png" );
		// const map = textureLoader.load( "./circle-0.png" );

		// const map = textureLoader.load( "circle-1.png" );

		// this.material = new THREE.SpriteMaterial( { map: map, color: 0xff0000, fog: true } );
		// this.material = new THREE.SpriteMaterial( { map: map, color: Math.random() * 0xffffff, fog: true } );
		this.material = new THREE.SpriteMaterial( { map: map, color: 0xffffff , fog: true } );
		

		this.el = new THREE.Sprite( this.material );
		this.el.position.set( this.x, this.y, this.z );
		this.el.userData.i = this.i

		
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

		
		// this.tween = new TWEEN.Tween({x:this.x, y:this.y}).to({x:x, y:y}, 300, TWEEN.Easing.Quadratic.InOut).onUpdate( (o) => {
		this.tween = new TWEEN.Tween({x:this.x, y:this.y}).to({x:x, y:y}, 300, TWEEN.Easing.Back.InOut).onUpdate( (o) => {
   			this.x = o.x
   			this.y = o.y
 		}).start()
 		
		
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

	    this.el.scale.set(this.r,this.r,1);
	    this.el.position.set(this.x, this.y, this.z)

		// this.el.style = `left:${this.x}px;top:${this.y}px;width:${this.r}px;height:${this.r}px;margin-top:${-this.r/2}px;margin-left:${-this.r/2}px`;
	}
}

const update = () => {
	// console.log('anim update');
	requestAnimationFrame(update)
	balls.forEach( b => b.update() )

	TWEEN.update()
	controls.update()

	camera.lookAt( group.position );

	const speed = 0.5 //2.7

	const elapsedTime = clock.getElapsedTime();
	if( K_AUTO_ROTATION && MODE === 'free'){
		group.rotation.y = elapsedTime * speed;
		group.rotation.x = elapsedTime * speed;
		group.rotation.z = elapsedTime * speed;
	}

	// let v = Math.ceil( elapsedTime  % 3.6) // 0..3.6 secs
	// console.log(v);
	// group.rotation.y = v;
	// group.rotation.y = (Math.PI/180) * v


	window.group = group

	renderer.render( scene, camera );
}


let selectedObject = null;

function onDocumentMouseMove( event ) {
	
	// console.log(event.target.id )
	if( event.target.id != renderer.domElement.id ) return

	event.preventDefault();
	if ( selectedObject ) {

		selectedObject.material.color.set( '#fff' );
		selectedObject = null;

	}


	const intersects = getIntersects( event.layerX, event.layerY );

	if ( intersects.length > 0 ) {

		const res = intersects.filter( function ( res ) {

			return res && res.object;

		} )[ 0 ];

		if ( res && res.object ) {

			selectedObject = res.object;
			selectedObject.material.color.set( '#f00' );

			console.log(selectedObject.userData.i);

		}

	}

}

const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector3();

function getIntersects( x, y ) {

	x = ( x / width ) * 2 - 1;
	y = - ( y / window.innerHeight ) * 2 + 1;

	mouseVector.set( x, y, 0.5 );
	raycaster.setFromCamera( mouseVector, camera );

	return raycaster.intersectObject( group, true );

}


