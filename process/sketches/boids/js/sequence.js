function sequence(mode='start', delay=0) {
	switch(mode){
		case 'start': run_sequence_start(delay); break;
	}
}

var speed_tweener = new TWEEN.Tween({v:speed})
var radius_tweener = new TWEEN.Tween({v:radius})


function run_sequence_start(delay){
	// globalMode = 'free'

	setTimeout(()=>{
		setMode('grouped')
	}, 10)
	setTimeout(()=>{
		setMode('free')
		// mouseSeek is turned off by setMode after a timeout, so turn it back on
		setTimeout( () => {
		  // mouseSeekInput.checked = mouseSeek = true
		}, 2000 );
	}, 800)

	radius = 0.1

	radius_tweener.to({v:RADIUS}, 5000, TWEEN.Easing.Bounce.Out).onUpdate( (o) => {
		updateRadius(o.v)
	})
	.delay(delay)
	.start()

	speed_tweener.to({v:SPEED}, 2000).onUpdate( (o) => {
		speedInput.value = o.v
	})
	.delay(delay)
	.start()
}

var selectedNode = undefined
function selectNode(i){
	console.log('selectNode', i, selectedNode)
	if( selectedNode ){
		deselectNode(selectedNode)
		return
	}
	selectedNode = i
	globalMode = 'selected'

	var R = Math.min( size.width, size.height) / 2.1
	
	new TWEEN.Tween({v:boids[i].radius}).to({v:R}, 750, TWEEN.Easing.Quadratic.In).onUpdate( (o) => {
		boids[i].radius = o.v
	}).start()

	boids[i]._position = boids[i].position.clone()
	// boids[i].forcedTargetPosition = new Victor(size.width/2, size.height/2 )
	// boids[i].quicknessCoefficient = 0.1
	// boids[i].quickness = 10
}
function deselectNode(i){
	console.log('deselectNode', i)

	globalMode = 'grouped'

	boids[i].forcedTargetPosition = boids[i]._position

	new TWEEN.Tween({v:boids[i].radius}).to({v:RADIUS}, 1000, TWEEN.Easing.Bounce.InOut).onUpdate( (o) => {
		boids[i].radius = o.v
	}).onComplete( () => {
		console.log('done deselectNode', i)
		selectedNode = null
		// boids[i].quicknessCoefficient = getQuicknessCoefficient() / 100;
	})
	.start()
}