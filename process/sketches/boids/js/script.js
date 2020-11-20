
// Set up canvas
const canvas = document.getElementById('boids');
const c = canvas.getContext('2d');

// // Get Firefox
// var browser=navigator.userAgent.toLowerCase();
// if(browser.indexOf('firefox') > -1) {
//   var firefox = true;
// }

// Detect Mobile
var mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) ? true : false;

// Set Size
var size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}
canvas.width = size.width;
canvas.height = size.height;
var center = new Victor( size.width / 2 ,size.height / 2 );

// Initialize Mouse
var mouse = {
  position: new Victor( innerWidth / 2, innerHeight / 2 )
};


function randomColor(colors) {
  return colors[ Math.floor( Math.random() * colors.length) ];
}



var speedIndex;
if ( size.width / 160 < 5 ) {
  speedIndex = 5;
} else if ( size.width / 180 > 8 ) {
  speedIndex = 9;
} else {
  speedIndex = size.width / 180;
}
console.log('speedIndex:', speedIndex)


var getCoefficient = gaussian(50, 9);
var getQuicknessCoefficient = gaussian(75,7.5);
var radiusCoefficients = [.5,.6,.7,.8,1];



// Create Boids Array
var boids = [];

/**
 * Create Boids Array
 *
 */
function createBoids() {

  // Instantiate all Boids
  for ( i = 0; i < numBoids; i++ ) {

    // Generate introversion coefficient
    var introversionCoefficient = getCoefficient() / 100;
    var quicknessCoefficient = getQuicknessCoefficient() / 100;
    var racismCoefficient = getCoefficient() / 100;
    var radiusCoefficient = Math.floor(Math.random() * radiusCoefficients.length);

    // Generate random coords
    var x = Math.ceil(Math.random()* ( size.width - ( radius * 2 ) ) ) + ( radius );
    var y = Math.ceil(Math.random()* ( size.height - ( radius * 2 ) ) ) + ( radius );
    x = size.width /2
    y = size.height / 2
    // For subsequent boids, check for collisions and generate new coords if exist
    if ( i !== 0 ) {
      for (var j = 0; j < boids.length; j++ ) {
        if ( getDistance(x, y, boids[j].x, boids[j].y) - ( radius + boids[j].radius ) < 0 ) {
          x = Math.ceil(Math.random()* ( size.width - ( radius * 2 ) ) ) + ( radius );
          y = Math.ceil(Math.random()* ( size.height - ( radius * 2 ) ) ) + ( radius );
          j = -1;
        }
      }
    }

    // Add new Boid to array
    boids.push( new Boid( {
      id: i,
      x: x,
      y: y,
      speedIndex: speedIndex,
      radius: radius,
      radiusCoefficient: radiusCoefficient,
      quickness: quickness,
      quicknessCoefficient: quicknessCoefficient,
      color: randomColor(colors),
      racism: racism,
      racismCoefficient: racismCoefficient,
      introversion: introversion,
      introversionCoefficient: introversionCoefficient
    } ) );
  }

}

/**
 * Setup and call animation function
 *
 */
function animate(time=0) {
  requestAnimationFrame(animate);
  TWEEN.update(time)

  // Calc elapsed time since last loop
  now = Date.now();
  elapsed = now - then;

  // FPS Reporting
  fpsReport++;
  if (fpsReport > 60) {
    fpsNum.innerHTML = Math.floor(1000/elapsed);
    fpsReport = 0;
  }

  // If enough time has elapsed, draw the next frame
  if (elapsed > fpsInterval) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      then = now - (elapsed % fpsInterval);
      // Drawing Code
      c.clearRect(0, 0, canvas.width, canvas.height);
      

      // Update all boids
      
      for (var i = 0; i < boids.length; i++ ) {
        boids[i].update();
      }

      if( selectedNode ){
        boids[selectedNode].draw()
      }
  }
}

// Setup animation
var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;
var fpsNum = document.getElementById('fps-number');
var fpsReport = 58;

/**
 * Start Animation of Boids
 *
 */
function startAnimating() {
  if(fps == null) { var fps = 60; }
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animate();
}

//Initalize program
// hide_devui()
// show_devui()

setTimeout( () => {
  createBoids();

  updateDiversity(diversity)

  startAnimating(60);

  sequence('start')

}, 200)

var globalMode = 'free'
// var globalMode = 'grouped'

function setMode(mode='free'){
  if( mode === 'grouped' ){
    groups_lock()
  }else{
    groups_release()
  }
  globalMode = mode
  console.log('setMode', globalMode)
}

function groups_lock(){
  // cols, by color
  var x = 100
  var y = 100
  var colWidth = (window.innerWidth-x) / colors.length
  var rowHeight = (window.innerHeight-y) / colors.length
  var rows = new Array( colors.length ).fill(0)


  for (var i=0; i<boids.length; i++) {
    // var colorIndex = colors.indexOf(boids[i].category)
    var colorIndex = colors.indexOf(boids[i].color)
    // console.log(colorIndex)
    rows[colorIndex]++
    boids[i].quicknessCoefficient = 0.1
    boids[i].forcedTargetPosition = new Victor(x + (colWidth*colorIndex), y + (rows[colorIndex]*rowHeight) )
  }

  //speedInput.value = speed = 50
  updateQuickness(10)
}

function groups_release(){
  mouseSeekInput.checked = mouseSeek = true
  // setTimeout( () => {
  //   mouseSeekInput.checked = mouseSeek = false
  // }, 2000 );

  var quicknessCoefficient = getQuicknessCoefficient() / 100;
  for (var i=0; i<boids.length; i++) {
    boids[i].forcedTargetPosition = boids[i].position.clone()
    boids[i].quicknessCoefficient = quicknessCoefficient //getQuicknessCoefficient() / 100;
  }
}

canvas.addEventListener('click', (evnt) => {
  var x = evnt.clientX
  var y = evnt.clientY
  // did we hit a boid?
  // console.log('click', x, y)
  for (var i=0; i<boids.length; i++) {
    var d = getDistance(x,y,boids[i].position.x,boids[i].position.y)
    // console.log(d)
    if( d < boids[i].radius ){
      console.log('clicked', boids[i].color, boids[i].id)
      
      if( boids[i].radius > RADIUS ){
        deselectNode(i)
        // boids[i].radius = RADIUS
        // boids[i].selected = false
      }else{
        selectNode(i)
        // boids[i].selected = true
        // boids[i].radius = 200
        //new TWEEN.Tween({boids[i].radius}).to(200).start()
      }
    }
  }
})


/**
 * Update mouse positions on mousemove
 *
 */
addEventListener('mousemove', function(event){
  mouse.position.x = event.clientX;
  mouse.position.y = event.clientY;
});

/**
 * Update boundary sizes on window resize
 *
 */
addEventListener('resize', function(){
  size.width = innerWidth;
  size.height = innerHeight;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  center.x = size.width/ 2;
  center.y = size.height / 2;
  if ( innerWidth >= 1000 && ! mobile ) {
    document.getElementById('mobile-boids-controls').style.display = 'none';
  } else {
    document.getElementById('mobile-boids-controls').style.display = 'block';
  }
});


