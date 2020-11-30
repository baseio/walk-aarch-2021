// RotationController.js from the mobiglobe project

import {
	Clock,
	Quaternion,
	Math as TMath
} from 'three';

const UP 	= {x:0, y:1, z:0}
const RIGHT = {x:1, y:0, z:0}
const PI2   = Math.PI*2
const HPI   = Math.PI/2

export class RotationController {

	constructor( target ){

		this.target = target

		this.kSensitivity = 0.02;    // drag sensitivity
		this.kFriction = 0.03;       // throw friction

		this.projectRotClamp = { min: -Math.PI/3, max:Math.PI/3 }
		this.projectRot = { x: 0, y: 0}
		
		this.mousePressed 	= false
		this.prevMousePos 	= { x: 0, y: 0 }
		this.deltaMousePos 	= { x: 0, y: 0 }

		this.xRotation = new Quaternion()
		this.yRotation = new Quaternion()

		this.clock = new Clock();

		document.addEventListener('mouseover', this.OnMouseUp.bind(this), false)
		document.addEventListener('mouseout',  this.OnMouseUp.bind(this), false)
		document.addEventListener('mouseup',   this.OnMouseUp.bind(this), false)
		document.addEventListener('mousedown', this.OnMouseDown.bind(this), false)
		document.addEventListener('mousemove', this.OnMouseMove.bind(this), false)
	}


	update(){
		this.deltaMousePos.x *= 1 - this.kFriction
		this.deltaMousePos.y *= 1 - this.kFriction
		
		if( !this.mousePressed ){
			// Autorotation
			const speed = 0.5 //2.7
			const elapsedTime = this.clock.getElapsedTime();

			// group.rotation.y = elapsedTime * speed;
			// group.rotation.x = elapsedTime * speed;
			// group.rotation.z = elapsedTime * speed;

			this.deltaMousePos.x = 1

			// this.deltaMousePos.x -= 0.005

			// this.projectRot.y += 0.1
		}

		/*
		if( App.Mode == 'pause' ){
			projectRot.y *= 1- 0.001;
		}else{
			projectRot.y += deltaMousePos.y * kSensitivity;
		}
		*/


		this.projectRot.x += this.deltaMousePos.x * this.kSensitivity
		this.projectRot.y += this.deltaMousePos.y * this.kSensitivity
		this.projectRot.y  = TMath.clamp(this.projectRot.y, this.projectRotClamp.min, this.projectRotClamp.max)

		this.xRotation.setFromAxisAngle(UP, this.projectRot.x)
		this.yRotation.setFromAxisAngle(RIGHT, this.projectRot.y)

		this.target.quaternion.multiplyQuaternions(this.yRotation, this.xRotation)
	}

	OnMouseUp(event){
		this.mousePressed = false
		event.preventDefault();
		return false;
	}

	OnMouseDown(event){
		const x = event.clientX
		const y = event.clientY
		this.mousePressed = true
		this.prevMousePos  = {x, y}
		event.preventDefault()
	}

	

	OnMouseMove( event ){
		if( !this.mousePressed ) return;		

		const x = event.clientX
		const y = event.clientY

		this.deltaMousePos = {x: x - this.prevMousePos.x, y: y - this.prevMousePos.y }
		this.prevMousePos  = {x: x, y: y}
	}

}