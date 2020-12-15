import {
	Sprite,
	SpriteMaterial,

	PlaneGeometry,
	ShaderMaterial,
	Vector3,
	AdditiveBlending,
	Mesh,


	RawShaderMaterial,
	Matrix4,
	
	CircleBufferGeometry,
	InstancedBufferGeometry,
	InstancedBufferAttribute


} from 'three';

// https://codepen.io/prisoner849/pen/XOENam

const vshader = `
    precision highp float;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 position;
    attribute vec3 translate;
    attribute vec4 color;
    attribute float scale;
    attribute vec2 uv;

    varying vec4 vColor;
    varying vec2 vUv;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
        mvPosition.xyz += position * scale;
        vColor = color;
        vUv = uv;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fshader = `
    precision highp float;

    uniform float inner;
    uniform float outer;

    varying vec4 vColor;
    varying vec2 vUv;
    
    void main() {
        vec2 uv = vUv;
        uv -= 0.5;
        
        float dist = length(uv);
        float mixing = smoothstep(inner - 0.01, inner, dist) - smoothstep(outer - 0.01, outer,  dist);
        
        vec3 baseColor = vec3(1);
        vec3 col = mix(baseColor, vColor.rgb, mixing);
        gl_FragColor = vec4(col, vColor.a);
    }
`;


export class CircleSprite {
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

		// this.material = new SpriteMaterial({
		//     map: normalTexture,
		//     transparent: true,
		//     depthTest: false,
		//     depthWrite: false,
		//     color: 0xffffff
		// });

		// this.el = new Sprite( this.material );



		// const geometry = new PlaneGeometry( 1, 1 );
		const geometry = new CircleBufferGeometry( 5.0, 50 );

		const circle = new InstancedBufferGeometry();
		circle.index = geometry.index;
		circle.attributes = geometry.attributes;

		const circleTranslateArray = [0.0, 0.0, 0.0];
		const circleColorArray = [0.0, 0.0, 0.0, 0.8];
		const circleScaleArray = [0.01];

		circle.setAttribute( 'scale', new InstancedBufferAttribute( new Float32Array(circleScaleArray), 1 ));
		circle.setAttribute( 'translate', new InstancedBufferAttribute( new Float32Array(circleTranslateArray), 3 ));
		circle.setAttribute( 'color', new InstancedBufferAttribute( new Float32Array(circleColorArray), 4 ));
		
		this.material = new RawShaderMaterial({ 
		    uniforms: {
		      inner: {value: 0.49},
		      outer: {value: 0.5}
		    },
		    vertexShader: vshader,
		    fragmentShader: fshader
		});


 		this.el = new Mesh( geometry, this.material );

		this.el.userData.i = this.i
		this.el.userData.data = userdata
		
		parent.add( this.el );
		

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
		// this.material.color.set( '#fff' );
		this.setTarget({x:this.x, y:this.y, z:this.z, o:1, r:this.enabledSize})
		// this.material.map = this.normalTexture
	}

	hide(){
		this.enabled = false
		// this.material.color.set( '#fff' );
		this.setTarget({x:this.x, y:this.y, z:this.z, o:0, r:0})
		// this.material.map = this.normalTexture
	}

	focus(){
		this.enabled = true
		this.setTarget({x:0, y:0, z:0, o:1, r:3})
		// this.material.map = this.normalTexture
	}

	hover(){
		// this.material.map = this.hoverTexture
		this.tr = this.enabledSize * 1.5
		this.tz = -0.05
	}

	unhover(){
		// this.material.map = this.normalTexture
		this.tr = this.enabledSize
		this.tz = 0
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

		if( window.app.mode === 'free' ){

			// this.r = Math.sin(this.x * 0.1)

			const v = 0.1 + Math.abs( Math.min( this.x, this.y ))
			this.r = Math.sin(v * 0.1)

			// this.material.uniforms.inner.value = this.r-0.1
			// this.material.uniforms.outer.value = this.r-0

		}

		// this.o = Math.min(0.5, this.o)

		this.el.scale.set(this.r, this.r, 1);
	    this.el.position.set(this.x, this.y, this.z)
		// this.material.opacity = this.o

		// translate attribute??
		// this.material.uniforms.translate.value = [this.x, this.y, this.z]

		// circle.setAttribute( 'scale', new InstancedBufferAttribute( new Float32Array(circleScaleArray), 1 ));
	}
}