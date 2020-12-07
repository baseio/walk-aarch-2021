import {
	SpriteMaterial,
	Sprite,
	Texture,
	TextureLoader,

	NoBlending,
	NormalBlending,
	AdditiveBlending,
	SubtractiveBlending,
	MultiplyBlending,

	CustomBlending,
	AddEquation,
	SubtractEquation,
	SrcAlphaFactor,
	OneMinusSrcAlphaFactor

} from 'three';


export const LogoShader = {
	uniforms: {
		inputBuffer: {value: null},
		overlayBuffer: {value: null}
	},

	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,

	fragmentShader: `
		uniform sampler2D inputBuffer;
		uniform sampler2D overlayBuffer;
		varying vec2 vUv;
		void main() {
			vec4 texel1 = texture2D(inputBuffer, vUv);
			vec4 texel2 = texture2D(overlayBuffer, vUv);
			vec3 diff = abs(texel1.rgb - texel2.rgb);
			gl_FragColor = vec4(diff, 1.0);
		}
	`
}

export class Logo {
	constructor(scene){
		this.el = this.setup()

		const scale = 1
		this.el.scale.set( scale, scale, scale )
		this.el.position.set( 0, 0, 0 );

		scene.add( this.el )
	}

	setup(){
		const texture = new TextureLoader().load( './tmp-logo.png' );
		const material = new SpriteMaterial({
			map: texture,
			color: 0xffffff,
			transparent: true,
			// blending: AdditiveBlending
			// blending: MultiplyBlending
			// blending: SubtractiveBlending
			// blending: SubtractiveBlending
		});

		// material.blending = CustomBlending;
		// // material.blendEquation = AddEquation; //default
		// material.blendEquation = SubtractEquation;
		// material.blendSrc = SrcAlphaFactor; //default
		// material.blendDst = OneMinusSrcAlphaFactor; //default


		return new Sprite( material );
	}
}