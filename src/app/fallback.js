
export const checkWebGL = () => {
	const c = document.createElement('canvas')
	const gl = c.getContext("webgl") || c.getContext("experimental-webgl");

    // render_fallback()
    // return false

    if(gl && gl instanceof WebGLRenderingContext){
    	return true
    }else{
    	render_fallback()
    	return false
    }

}

const render_fallback = () => {
	console.log('Error: WebGL not supported');
	document.body.innerHTML = `
		<style type="text/css">
			#fallback {
				display: block;
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				width: 100%;
				height: 100%;
				background-color: #222;
				background-image: url(fallback.png);
				background-repeat: no-repeat;
				background-position: center;
				background-size: cover;
			
				font-family: "Univers LT W02 55 Roman", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;
				text-align: center;
				color: #fff;
			    
			    text-transform: uppercase;
			    margin: 2px;
			    user-select: none;

			    font-size: 24px;
			}

		</style>
		<div id="fallback">
			<!-- Sorry. Unfortunately your browser does not support WebGL. -->
		</div>

	`
}
