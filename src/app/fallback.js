
export const checkWebGL = () => {
	const c = document.createElement('canvas')
	// const gl = false
	const gl = c.getContext("webgl") || c.getContext("experimental-webgl");

	return (gl && gl instanceof WebGLRenderingContext)
}
