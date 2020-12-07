// ----------------------------------------
// AUTHOR: Bruno Imbrizi
// Three.js version of the technique described here: https://forum.openframeworks.cc/t/motion-trails-with-fbo/2237
//
// sceneContent contains cube
// render sceneContent, cameraPerspective onto textureNew
// 
// sceneComp contains quadComp with material (textureNew + textureOld)
// render sceneComp, cameraOrtho onto textureComp
// 
// sceneScreen contains quadScreen with material (textureComp)
// render sceneScreen, cameraOrtho onto textureOld
// render sceneScreen, cameraOrtho onto screen/
// ----------------------------------------

import {
  Scene,
  OrthographicCamera,
  PerspectiveCamera,
  WebGLRenderTarget,
  WebGLRenderer,
  PlaneBufferGeometry,
  ShaderMaterial,
  MeshBasicMaterial,
  Mesh,
  LinearFilter,
  NearestFilter,
  RGBAFormat
} from 'three';



var cameraOrtho, cameraPerspective;
var sceneComp, sceneContent, sceneScreen;
var renderer;

var textureOld, textureNew, textureComp;

var controls;

// init();
// animate();

export const TrailsRenderer = function( opts ){

  init( opts )

  return {
    scene: sceneContent,
    camera: cameraPerspective,
    render: animate,
    renderer,
  }
}

function init( opts ) {
  // scenes
  sceneComp = new Scene();
  sceneContent = new Scene();
  sceneScreen = new Scene();

  // cameras
  cameraOrtho = new OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000);
  cameraOrtho.position.z = 1 //100;

  cameraPerspective = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.001, 10000);
  cameraPerspective.position.z = 2 //400;

  // render targets
  textureOld = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter, format: RGBAFormat });
  textureNew = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter, format: RGBAFormat });
  textureComp = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter, format: RGBAFormat });
  
  // renderer
  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  // document.body.appendChild( renderer.domElement );
  renderer.domElement.id = 'three'
  document.querySelector(opts.selector).appendChild( renderer.domElement );
    
  initQuads();
}



function initQuads() {
  var geometry = new PlaneBufferGeometry(window.innerWidth, window.innerHeight);
  
  var material = new ShaderMaterial({
    uniforms: {
      tOld: { value: textureOld.texture },
      tNew: { value: textureNew.texture },
    },
    vertexShader: VERTSHADER,
    fragmentShader: FRAGSHADER
  });

  var quadComp = new Mesh(geometry, material);
  sceneComp.add(quadComp);

  material = new MeshBasicMaterial({ map: textureComp.texture });
  var quadScreen = new Mesh(geometry, material);
  sceneScreen.add(quadScreen);
}

function animate() {
  // draw
  renderer.setRenderTarget(textureNew)
  renderer.render(sceneContent, cameraPerspective);

  renderer.setRenderTarget(textureComp)
  renderer.render(sceneComp, cameraOrtho);

  renderer.setRenderTarget(textureOld)
  renderer.render(sceneScreen, cameraOrtho);

  renderer.setRenderTarget(null);
  renderer.render(sceneScreen, cameraOrtho);
  
  // renderer.render(sceneContent, cameraPerspective);


  // renderer.render(sceneContent, cameraPerspective, textureNew);
  // renderer.render(sceneComp, cameraOrtho, textureComp);
  // renderer.render(sceneScreen, cameraOrtho, textureOld);
  // renderer.render(sceneScreen, cameraOrtho);

  // animate
  // requestAnimationFrame(animate);
}

const FRAGSHADER = `
  uniform sampler2D tOld;
  uniform sampler2D tNew;

  // uniform sampler2D tDiffuse;
  // uniform float h;

  varying vec2 vUv;

  // from http://theorangeduck.com/page/avoiding-shader-conditionals
  float when_gt(float x, float y) {
    return max(sign(x - y), 0.0);
  }

  void main() {
    vec4 texelOld = texture2D(tOld, vUv);
    vec4 texelNew = texture2D(tNew, vUv);
    
    // texelOld *= 0.999;

    // float h = 1.0 / 512.0;
    // vec4 sum = vec4( 0.0 );
    // sum += texture2D( texelOld, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
    // sum += texture2D( texelOld, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
    // sum += texture2D( texelOld, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
    // sum += texture2D( texelOld, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
    // sum += texture2D( texelOld, vec2( vUv.x, vUv.y ) ) * 0.1633;
    // sum += texture2D( texelOld, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
    // sum += texture2D( texelOld, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
    // sum += texture2D( texelOld, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
    // sum += texture2D( texelOld, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;
    // // gl_FragColor = sum;
    // texelOld = sum;
    


    // the expressions bellow are equivalent to
    // if (texelOld.a < 0.2) texelOld.a = 0.0;

    float t = 0.01;

    texelOld.r *= when_gt(texelOld.r, t);
    texelOld.g *= when_gt(texelOld.g, t);
    texelOld.b *= when_gt(texelOld.b, t);
    texelOld.a *= when_gt(texelOld.a, t);

    // gl_FragColor = texelOld + texelNew;
    
    // gl_FragColor = mix(texelOld, texelNew, texelNew.a * 0.5);
    
    // gl_FragColor = mix(texelOld, texelNew, texelNew.a);

    vec4 tmp = mix(texelOld, texelNew, texelOld.a * 0.01);

    gl_FragColor = mix(tmp, texelNew, texelNew.a * 0.9);


  }
`


const _FRAGSHADER = `
  uniform sampler2D tOld;
  uniform sampler2D tNew;

  varying vec2 vUv;

  // from http://theorangeduck.com/page/avoiding-shader-conditionals
  float when_gt(float x, float y) {
    return max(sign(x - y), 0.0);
  }

  void main() {
    vec4 texelOld = texture2D(tOld, vUv);
    vec4 texelNew = texture2D(tNew, vUv);
    // texelOld *= 0.96;
    texelOld *= 0.97;

    // the expressions bellow are equivalent to
    // if (texelOld.a < 0.2) texelOld.a = 0.0;

    // texelOld.r *= when_gt(texelOld.r, 0.2);
    // texelOld.g *= when_gt(texelOld.g, 0.2);
    // texelOld.b *= when_gt(texelOld.b, 0.2);
    // texelOld.a *= when_gt(texelOld.a, 0.2);

    // gl_FragColor = texelOld + texelNew;
    gl_FragColor = mix(texelOld, texelNew, texelNew.a);

  }
`

const VERTSHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`
