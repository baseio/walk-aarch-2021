var colors = [
  '#ffffff',
  '#4286f4',
  '#f4416a',
  '#41f4a0',
  '#33ff33',
  '#a341f4',
  '#f48341',
  '#f4e841',
  '#42ebf4',
  '#ff0000'
];

var walls         = false;
var mouseSeek     = false;
var collisions    = false;

// start at $radius, then tween to $RADIUS
var radius        = 0.01
var RADIUS 		  = 15

// start at $speed, then tween to $SPEED
var speed         = 10.9
var SPEED 		  = 1

var diversity     = 1; // 1..10 // colors.length
var quickness     = 1;
var introversion  = 0.1 	//0..1;
var racism        = 2; // 0..2

var numBoids      = 70 //100


function printSettings(){
	console.log('settings:', {
		walls,
		mouseSeek,
		collisions,
		radius,
		speed,
		diversity,
		quickness,
		introversion,
		racism,
		numBoids
	})
}