
// Hide Elements on Mobile
document.getElementById('collisions-mobile').style.display = 'none';
document.getElementById('mouse-seek-mobile').style.display = 'none';

// Mobile Closers
var mobileClosers = document.getElementsByClassName('boids-control-close');
for (var i = 0; i < mobileClosers.length; i++) {
  mobileClosers[i].onclick = function() {
    this.parentNode.classList.toggle('show');
    document.getElementById('mobile-boids-controls').style.display = 'block';
  }
}

function hide_devui(){
  document.getElementById('boids-controls-container').style.display = 'none'
}
function show_devui(){
  document.getElementById('boids-controls-container').style.display = 'flex'
}


// Walls
var wallsInput = document.getElementById('walls');
wallsInput.checked = walls;
wallsInput.onclick = function() {
  if ( !this.checked ) {
    this.checked = false;
    wallsMobile.dataset.checked = false;
    wallsMobile.classList.toggle('boids-checkbox-on');
    walls = false;
  } else {
    this.checked = true;
    wallsMobile.dataset.checked = true;
    wallsMobile.classList.toggle('boids-checkbox-on');
    walls = true;
  }
}
var wallsMobile = document.getElementById('walls-mobile');
wallsMobile.dataset.checked = walls;
wallsMobile.onclick = function() {
  if ( this.dataset.checked == 'false') {
    this.dataset.checked = true;
    wallsInput.checked = true;
    this.classList.toggle('boids-checkbox-on');
    walls = true;
  } else {
    this.dataset.checked = false;
    wallsInput.checked = false;
    this.classList.toggle('boids-checkbox-on');
    walls = false;
  }
}

// Collision Detection
var collisionDetectionInput = document.getElementById('collision-detection');
collisionDetectionInput.checked = collisions //? 'checked' : '';
collisionDetectionInput.onclick = function() {
  if ( !this.checked ) {
    this.checked = false;
    collisionDetectionMobile.dataset.checked = false;
    collisionDetectionMobile.classList.toggle('boids-checkbox-on');
    collisions = false;
  } else {
    this.checked = true;
    collisionDetectionMobile.dataset.checked = true;
    collisionDetectionMobile.classList.toggle('boids-checkbox-on');
    collisions = true;
  }
}
var collisionDetectionMobile = document.getElementById('collisions-mobile');
collisionDetectionMobile.dataset.checked = collisions;
collisionDetectionMobile.onclick = function() {
  if ( this.dataset.checked == 'false') {
    this.dataset.checked = true;
    collisionDetectionInput.checked = true;
    this.classList.toggle('boids-checkbox-on');
    collisions = true;
  } else {
    this.dataset.checked = false;
    collisionDetectionInput.checked = false;
    this.classList.toggle('boids-checkbox-on');
    collisions = false;
  }
}

// Mouse Seek
var mouseSeekInput = document.getElementById('mouse-seek');
mouseSeekInput.checked = mouseSeek;
mouseSeekInput.onclick = function() {
  if ( !this.checked ) {
    this.checked = false;
    mouseSeekMobile.dataset.checked = false;
    mouseSeekMobile.classList.toggle('boids-checkbox-on');
    mouseSeek = false;
  } else {
    this.checked = true;
    mouseSeekMobile.dataset.checked = true;
    mouseSeekMobile.classList.toggle('boids-checkbox-on');
    mouseSeek = true;
  }
}
var mouseSeekMobile = document.getElementById('mouse-seek-mobile');
mouseSeekMobile.dataset.checked = mouseSeek;
mouseSeekMobile.onclick = function() {
  if ( this.dataset.checked == 'false') {
    this.dataset.checked = true;
    mouseSeekInput.checked = true;
    this.classList.toggle('boids-checkbox-on');
    mouseSeek = true;
  } else {
    this.dataset.checked = false;
    mouseSeekInput.checked = false;
    this.classList.toggle('boids-checkbox-on');
    mouseSeek = false;
  }
}

// Introversion
var introversionControlContainer = document.getElementById('introversion-control-container');
var introversionInput = document.getElementById('introversion');
introversionInput.onchange = function() {
  introversion = this.value// / 10;
  updateIntroversion(introversion);
}
var introversionMobile = document.getElementById('introversion-mobile');
// set default?
introversionMobile.onclick = function() {
  document.getElementById('mobile-boids-controls').style.display = 'none';
  introversionControlContainer.classList.toggle('show');
}
function updateIntroversion(value) {
  for (var i=0; i<boids.length; i++) {
    boids[i].introversion = value * boids[i].introversionCoefficient;
  }
}
introversionInput.value = introversion


// Speed
var speedControlContainer = document.getElementById('speed-control-container');
var speedInput = document.getElementById('speed');
speedInput.onchange = function() {
  // quickness = this.value / 10 + .5;
  quickness = this.value // 10 + .5;
  console.log('speed:', this.value)
  updateQuickness(quickness);
}
var speedMobile = document.getElementById('speed-mobile');
speedMobile.onclick = function() {
  document.getElementById('mobile-boids-controls').style.display = 'none';
  speedControlContainer.classList.toggle('show');
}
function updateQuickness(value) {
  for (var i=0; i<boids.length; i++) {
    boids[i].quickness = value * boids[i].quicknessCoefficient;
    boids[i].maxSpeed = speedIndex * boids[i].quickness;
  }
}
speedInput.value = speed


// Racism
var racismControlContainer = document.getElementById('racism-control-container');
var racismInput = document.getElementById('racism');
racismInput.onchange = function() {
  racism = this.value// / 5;
  console.log('racism:', racism)
  updateRacism(racism);
}
var racismMobile = document.getElementById('racism-mobile');
racismMobile.onclick = function() {
  document.getElementById('mobile-boids-controls').style.display = 'none';
  racismControlContainer.classList.toggle('show');
}
function updateRacism(value) {
  for (var i=0; i<boids.length; i++) {
    boids[i].racism = value * boids[i].racismCoefficient;
  }
}
racismInput.value = racism


// Diversity
var diversityControlContainer = document.getElementById('diversity-control-container');
var diversityInput = document.getElementById('diversity');
diversityInput.onchange = function() {
  diversity = this.value;
  updateDiversity(diversity);
}
var diversityMobile = document.getElementById('diversity-mobile');
diversityMobile.onclick = function() {
  document.getElementById('mobile-boids-controls').style.display = 'none';
  diversityControlContainer.classList.toggle('show');
}
function updateDiversity(value) {
  for (var i=0; i<boids.length; i++) {
    boids[i].color = colors[ i % value ];
  }
}
diversityInput.value = diversity


//

function updateRadius(value) {
  radius = value
  for (var i=0; i<boids.length; i++) {
    boids[i].radius = radius
  }
}

//
var modeFreeButton = document.getElementById('mode-free');
modeFreeButton.addEventListener('click', () => {
  setMode('free')
})

var modeGroupedButton = document.getElementById('mode-grouped');
modeGroupedButton.addEventListener('click', () => {
  setMode('grouped')
})

var modeColordButton = document.getElementById('mode-colors');
modeColordButton.addEventListener('click', () => {
  if( boids[0].diversity === colors.length ){
    updateDiversity( 1 )  
  }else{
    updateDiversity( colors.length )
  }
})


