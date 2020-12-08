// from https://codepen.io/prisoner849/pen/rNBXVmb?editors=0010


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(0, 0, 100);
var renderer = new THREE.WebGLRenderer({
  antialias: true
});
//renderer.setClearColor(0x404040)
var canvas = renderer.domElement;
document.body.appendChild(canvas);

var controls = new THREE.OrbitControls(camera, canvas);

var sideVals = [3, 4, 5, 100];

var points = [];
var colors = [];
var c = new THREE.Color();
var sides = [];
var amount = 11000;
for (let i = 0; i < amount; i++) {
  points.push(
    new THREE.Vector3(
      THREE.Math.randFloatSpread(200),
      THREE.Math.randFloatSpread(200),
      THREE.Math.randFloatSpread(200)
    )
  );
  c.set(Math.random() * 0xffffff);
  colors.push(c.r, c.g, c.b);
  sides.push(sideVals[THREE.Math.randInt(0, 3)]);
}

var geom = new THREE.BufferGeometry().setFromPoints(points);
geom.addAttribute(
  "color",
  new THREE.BufferAttribute(new Float32Array(colors), 3)
);
geom.addAttribute(
  "sides",
  new THREE.BufferAttribute(new Float32Array(sides), 1)
);
var mat = new THREE.PointsMaterial({
  vertexColors: THREE.VertexColors,
  alphaTest: 0.5,
  size: 10
});
mat.extensions = { derivatives: true }; // adds to fragment shader: #extension GL_OES_standard_derivatives : enable
mat.onBeforeCompile = shader => {
  console.log(shader.vertexShader);
  shader.vertexShader =
    `
attribute float sides;
varying float vSides;
` + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    `gl_PointSize = size;`,
    `gl_PointSize = size;
vSides = sides;`
  );

  shader.fragmentShader =
    `
varying float vSides;
` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <clipping_planes_pars_fragment>`,
    `#include <clipping_planes_pars_fragment>

float getShape(float thickness, float outer, vec2 uv){
    uv *= 2.0;
    float a = atan(uv.x,-uv.y) + 3.1415926;
    float r = 3.1415926 * 2. / vSides;
    float d = cos( floor( .5 + a / r ) * r - a ) * length( uv );
    return smoothstep(thickness - fwidth(d), thickness + fwidth(d), d) - smoothstep(outer - fwidth(d), outer + fwidth(d), d);
}
`
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    `vec4 diffuseColor = vec4( diffuse, opacity );`,
    `
vec3 base = vec3(0);
float color = getShape(0.2, 0.4, gl_PointCoord - 0.5);
vec4 diffuseColor = vec4( mix(base, diffuse, color), opacity );
float shape = getShape(0.0, 0.5, gl_PointCoord - 0.5);
diffuseColor.a = shape;

`
  );
};
var collective = new THREE.Points(geom, mat);
scene.add(collective);

var stats = new Stats();
document.body.appendChild(stats.dom);

render();

function render() {
  if (resize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  stats.update();
  requestAnimationFrame(render);
}

function resize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
