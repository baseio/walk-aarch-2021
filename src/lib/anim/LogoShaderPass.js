import {
	LinearFilter,
	MeshBasicMaterial,
	NearestFilter,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from "three";
import { Pass } from "three/examples/jsm/postprocessing/Pass.js";
// import { AfterimageShader } from "three/examples/jsm/shaders/AfterimageShader.js";

const LogoShader = {
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

var LogoShaderPass = function ( damp ) {

	Pass.call( this );

	this.shader = LogoShader;

	this.uniforms = UniformsUtils.clone( this.shader.uniforms );

	// this.uniforms[ "damp" ].value = damp !== undefined ? damp : 0.96;

	this.textureComp = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: LinearFilter,
		magFilter: NearestFilter,
		format: RGBAFormat

	} );

	this.textureOld = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {
		minFilter: LinearFilter,
		magFilter: NearestFilter,
		format: RGBAFormat

	} );

	this.shaderMaterial = new ShaderMaterial( {
		uniforms: this.uniforms,
		vertexShader: this.shader.vertexShader,
		fragmentShader: this.shader.fragmentShader

	} );

	this.compFsQuad = new Pass.FullScreenQuad( this.shaderMaterial );

	var material = new MeshBasicMaterial();
	this.copyFsQuad = new Pass.FullScreenQuad( material );

};

LogoShaderPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: LogoShaderPass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		// this.uniforms[ "tOld" ].value = this.textureOld.texture;
		// this.uniforms[ "tNew" ].value = readBuffer.texture;

		this.uniforms['inputBuffer'].value = readBuffer.texture // grab main scene
		this.uniforms['overlayBuffer'].value = this.textureOld.texture // TMP grab logo

		renderer.setRenderTarget( this.textureComp );
		this.compFsQuad.render( renderer );

		this.copyFsQuad.material.map = this.textureComp.texture;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.copyFsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			this.copyFsQuad.render( renderer );

		}

		// Swap buffers.
		var temp = this.textureOld;
		this.textureOld = this.textureComp;
		this.textureComp = temp;
		// Now textureOld contains the latest image, ready for the next frame.

	},

	setSize: function ( width, height ) {

		this.textureComp.setSize( width, height );
		this.textureOld.setSize( width, height );

	}

} );

export { LogoShaderPass };
