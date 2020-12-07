
import {throttle, debounce} from 'lodash'
import * as PostProcessing from 'postprocessing'
import * as Three from 'three'
import autobind from 'autobind-decorator'
import domtoimage from 'dom-to-image-more'
import MobileDetect from 'mobile-detect'

import * as config from '../config'
import * as util from '../util'
import StylesheetVariables from '../sass'

const BlendShader = {
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

const cachedTextures = {}
const preloadingTextureCallbacks = {}

class BackdropManager {
	active = false
	loader = new Three.TextureLoader
	clock = new Three.Clock
	backgroundLoading = true
	artworkLoading = true
	overlayLoading = true

	constructor(view, canvas, backdrop, artworkPreload, backgroundPreload) {
		const mobileDetect = new MobileDetect(window.navigator.userAgent)

		view.backdropManager = this

		this.rootContainer = document.getElementById('___gatsby')
		this.viewStore = view
		this.canvas = canvas
		this.backdrop = backdrop
		this.handleMobileScrollDebounced = debounce(this.handleMobileScroll, 20)


		// Variables and buffers

		const {offsetWidth: w, offsetHeight: h} = canvas
		this.width = w
		this.height = h
		this.focusWidth = backdrop.focusWidth
		this.focusHeight = backdrop.focusHeight
		this.focusY = backdrop.focusY
		this.primaryColor = backdrop.primaryColor || StylesheetVariables.primaryColor
		this.secondaryColor = backdrop.secondaryColor || StylesheetVariables.secondaryColor
		this.reloadOverlayThrottled = throttle(this.reloadOverlay, config.backdropReloadOverlayThrottleWait)
		this.renderScale = mobileDetect.mobile() ? window.devicePixelRatio : Math.min(window.devicePixelRatio, 1.25)
		this.calculateCameraOffsets(w, h)

		const renderer = this.renderer = new Three.WebGLRenderer({canvas: canvas, alpha: false})
		renderer.setPixelRatio(this.renderScale)

		const overlayBuffer = this.overlayBuffer = new Three.WebGLRenderTarget(w, h)


		// Scenes

		const backgroundScene = this.backgroundScene = new Three.Scene
		backgroundScene.background = new Three.Color(this.primaryColor)

		const scene = this.scene = new Three.Scene

		const overlayScene = this.overlayScene = new Three.Scene
		overlayScene.background = new Three.Color(this.primaryColor)


		// Cameras

		const camera = this.camera = new Three.OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 2000)
		camera.position.z = 10

		const overlayCamera = this.overlayCamera = new Three.OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 2000)
		overlayCamera.position.z = 10


		// Passes

		const mobileMedia = window.matchMedia(StylesheetVariables.tabletMedia).matches

		const backgroundRenderPass = this.backgroundRenderPass = new PostProcessing.RenderPass(backgroundScene, camera)
		backgroundRenderPass.clear = false
		backgroundRenderPass.renderToScreen = mobileMedia

		const renderPass = this.renderPass = new PostProcessing.RenderPass(scene, camera)
		renderPass.clear = false
		renderPass.renderToScreen = mobileMedia

		const shaderMaterial = this.shaderMaterial = new Three.ShaderMaterial(BlendShader)
		shaderMaterial.uniforms.overlayBuffer.value = overlayBuffer.texture

		const shaderPass = this.shaderPass = new PostProcessing.ShaderPass(shaderMaterial)
		shaderPass.renderToScreen = !mobileMedia


		// Composer and loading

		const composer = this.composer = new PostProcessing.EffectComposer(renderer)
		composer.addPass(new PostProcessing.ClearPass)
		composer.addPass(backgroundRenderPass)
		composer.addPass(renderPass)

		if (!mobileMedia) {
			composer.addPass(shaderPass)
		}

		this.active = true
		this.loadSprites(artworkPreload, backgroundPreload)
		this.loadOverlay(overlayScene)

		document.body.classList.add('backdrop')

		if (mobileMedia) {
			this.handleMobileScroll()
			this.rootContainer.addEventListener('scroll', this.handleMobileScrollDebounced)
		}
	}

	@autobind handleMobileScroll() {
		if (this.rootContainer.scrollTop === 0) {
			this.rootContainer.scrollTop = 1
		} else if (this.rootContainer.scrollTop === (this.rootContainer.scrollHeight - this.rootContainer.offsetHeight)) {
			this.rootContainer.scrollTop = this.rootContainer.scrollTop
		}
	}

	refreshLoadingStatus() {
		const loading = this.backgroundLoading || this.artworkLoading || this.overlayLoading
		const opacity = Number(!loading)

		this.viewStore.backdropLoading = loading

		if (this.backgroundSprite) {
			this.backgroundSprite.material.opacity = opacity
		}

		if (this.artworkSprite) {
			this.artworkSprite.material.opacity = opacity
		}

		if (loading) {
			if (this.overlayLoading) {
				document.body.classList.add('backdrop-loading')
			}
		} else {
			document.body.classList.remove('backdrop-loading')
		}

		this.queueFrames()
	}

	loadNewImage(backdrop) {
		const artwork = backdrop.artwork?.localFile.publicURL ?? backdrop.thumbnail?.localFile.publicURL
		const background = backdrop.background?.localFile.publicURL

		if (this.artwork !== artwork && this.background !== background) {
			this.focusWidth = backdrop.focusWidth
			this.focusHeight = backdrop.focusHeight
			this.focusY = backdrop.focusY
			this.primaryColor = backdrop.primaryColor || StylesheetVariables.primaryColor
			this.secondaryColor = backdrop.secondaryColor || StylesheetVariables.primaryColor
			this.backgroundScene.background = new Three.Color(this.primaryColor)
			this.overlayScene.background = new Three.Color(this.secondaryColor)
			this.calculateCameraOffsets(this.width, this.height)
			this.loadSprites(artwork, background)
		}
	}


	// Sprites

	loadTexture(texture, callback) {
		if (texture instanceof Element) {
			if (texture.complete) {
				this.loadTextureFromElement(texture, callback)
			} else {
				preloadingTextureCallbacks[texture.src] = () => {
					this.loadTextureFromElement(texture, callback)
				}
			}
		} else if (cachedTextures[texture]) {
			callback(cachedTextures[texture])
		} else {
			this.loader.load(texture, loadedTexture => {
				cachedTextures[texture] = loadedTexture
				callback(loadedTexture)
			})
		}
	}

	loadTextureFromElement(element, callback) {
		const texture = new Three.Texture(element)

		if (this.backdrop.flipY) {
			texture.center.set(0.5, 0.5)
			texture.repeat.set(1, -1)
		}

		texture.needsUpdate = true

		cachedTextures[element.src] = texture
		callback(texture)
	}

	finishArtworkPreload() {
		preloadingTextureCallbacks[this.artworkPreload.src]()
	}

	finishBackgroundPreload() {
		preloadingTextureCallbacks[this.backgroundPreload.src]()
	}

	createSprite(image, callback) {
		const material = new Three.SpriteMaterial({transparent: true})
		const sprite = new Three.Sprite(material)

		this.loadTexture(image, texture => {
			material.map = texture
			material.needsUpdate = true
			sprite.scale.set(4096, 4096)

			if (callback) {
				callback(texture)
			}
		})

		return sprite
	}

	reloadSprite(sprite, texture) {
		sprite.material.map = texture
		sprite.material.needsUpdate = true
		sprite.scale.set(4096, 4096)
	}

	async loadSprites(artwork, background) {
		if (artwork instanceof Element) {
			this.artworkPreload = artwork
		} else {
			this.artworkSrc = artwork
		}

		if (background instanceof Element) {
			this.backgroundPreload = background
		} else {
			this.backgroundSrc = background
		}

		this.backgroundLoading = true
		this.artworkLoading = true
		this.refreshLoadingStatus()


		// Background

		if (background) {
			if (this.backgroundSprite) {
				this.loadTexture(background, texture => {
					this.backgroundLoading = false
					this.reloadSprite(this.backgroundSprite, texture)
					this.refreshLoadingStatus()
				})
			} else {
				const backgroundSprite = this.backgroundSprite = this.createSprite(background, () => {
					this.backgroundLoading = false
					this.refreshLoadingStatus()
				})

				this.backgroundScene.add(backgroundSprite)
			}
		} else {
			this.backgroundLoading = false
			this.refreshLoadingStatus()
		}


		// Background cover

		if (!this.backgroundPlane) {
			const planeGeometry = new Three.PlaneBufferGeometry(config.backdropArtworkSize * 4, config.backdropArtworkSize * 4)

			const planeMaterial = new Three.MeshBasicMaterial({
				color: this.secondaryColor,
				transparent: true,
				side: Three.DoubleSide
			})

			const plane = this.backgroundPlane = new Three.Mesh(planeGeometry, planeMaterial)

			this.scene.add(plane)
		}


		// Artwork

		if (this.artworkSprite) {
			this.loadTexture(artwork, texture => {
				this.artworkLoading = false
				this.reloadSprite(this.artworkSprite, texture)
				this.refreshLoadingStatus()
			})
		} else {
			const artworkSprite = this.artworkSprite = this.createSprite(artwork, t => {
				this.artworkLoading = false
				this.refreshLoadingStatus()
			})

			this.scene.add(artworkSprite)
		}
	}


	// Overlay

	createCanvasTexture(canvas) {
		const texture = new Three.CanvasTexture(canvas)
		texture.generateMipmaps = false
		texture.wrapS = texture.wrapT = Three.ClampToEdgeWrapping
		texture.minFilter = Three.LinearFilter

		return texture
	}

	sizeOverlay(texture, sprite) {
		const w = texture.image.width
		const h = texture.image.height

		sprite.scale.set(w, h)
		sprite.position.x = -(this.width - w)/2
		sprite.position.y = (this.height - h)/2
	}

	async loadOverlay(scene) {
		const canvas = await domtoimage.toCanvas(document.getElementsByClassName('site-header')[0])
		const texture = this.overlayCanvasTexture = this.createCanvasTexture(canvas)
		const material = this.overlayMaterial = new Three.SpriteMaterial({map: texture})
		const sprite = this.overlaySprite = new Three.Sprite(material)

		scene.add(sprite)

		this.sizeOverlay(texture, sprite)
		this.overlayLoading = false
		this.queueFrames()
		this.refreshLoadingStatus()
	}

	async reloadOverlay() {
		const canvas = await domtoimage.toCanvas(document.getElementsByClassName('site-header')[0])

		if (this.overlayCanvasTexture) {
			this.overlayCanvasTexture.dispose()
		}

		if (this.overlayMaterial) {
			const texture = this.overlayMaterial.map = this.overlayCanvasTexture = this.createCanvasTexture(canvas)
			this.sizeOverlay(texture, this.overlaySprite)
			this.overlayMaterial.needsUpdate = true
		}

		this.queueFrames()
	}


	// Rendering

	render() {
		const tabletMedia = window.matchMedia(StylesheetVariables.tabletMedia).matches
		let percent

		if (tabletMedia) {
			percent = this.rootContainer.scrollTop/(this.rootContainer.scrollHeight - this.rootContainer.offsetHeight)
		} else {
			percent = window.pageYOffsetBeforeModal/(document.body.offsetHeight - window.innerHeight)
		}

		if (this.forceFrames > 0 || percent !== this.lastPercent) {
			this.composer.render(this.clock.getDelta())
			this.renderer.setRenderTarget(this.overlayBuffer)
			this.renderer.render(this.overlayScene, this.overlayCamera)

			if (tabletMedia) {
				this.backgroundPlane.material.opacity = config.mobileBackdropBackgroundPlaneOpacity(percent)
				this.camera.position.y = util.lerp(percent, this.cameraY, 0)
				this.camera.zoom = config.mobileBackdropCameraZoom(percent, this.cameraZoom, this.cameraFit)
			} else {
				this.backgroundPlane.material.opacity = config.backdropBackgroundPlaneOpacity(percent)
				this.camera.position.y = util.lerp(percent, this.cameraY, 0)
				this.camera.zoom = config.backdropCameraZoom(percent, this.cameraZoom, this.cameraFit)
			}

			this.camera.updateProjectionMatrix()

			if (tabletMedia) {
				const backdropFrame = this.viewStore.backdropFrameRef.current
				const pieceInfo = this.viewStore.pieceInfoRef.current

				if (backdropFrame && pieceInfo) {
					const y = config.mobileBackdropFrameY(percent, backdropFrame.offsetTop, backdropFrame.offsetHeight, pieceInfo.offsetTop)

					backdropFrame.style.transform = `scaleY(${y})`
				}
			}

			if (this.active && percent <= 0.01) {
				document.body.style.background = this.primaryColor
			} else {
				document.body.style.background = ''
			}

			if (tabletMedia) {
				if (this.active && percent >= config.mobileHalfVisiblePercent) {
					document.body.classList.add('backdrop-half')
				} else {
					document.body.classList.remove('backdrop-half')
				}

				if (this.active && percent >= config.mobileFeaturedVisiblePercent) {
					document.body.classList.add('backdrop-down')
				} else {
					document.body.classList.remove('backdrop-down')
				}
			} else {
				if (this.active && percent >= config.featuredVisiblePercent) {
					document.body.classList.add('backdrop-down')
				} else {
					document.body.classList.remove('backdrop-down')
				}
			}

			if (percent !== this.lastPercent) {
				this.queueFrames()
			}

			this.forceFrames -= 1
		}

		this.lastPercent = percent
	}

	calculateCameraOffsets(w, h) {
		if (w > h) {
			this.cameraZoom = h/(config.backdropArtworkSize * this.focusHeight)
		} else {
			this.cameraZoom = w/(config.backdropArtworkSize * this.focusWidth)
		}

		this.cameraY = config.backdropArtworkSize * this.focusY
	}

	resize(w, h) {
		const mobileMedia = window.matchMedia(StylesheetVariables.tabletMedia).matches

		this.backgroundRenderPass.renderToScreen = mobileMedia
		this.renderPass.renderToScreen = mobileMedia
		this.shaderPass.renderToScreen = !mobileMedia

		this.width = w
		this.height = h

		this.composer.setSize(w, h)
		this.overlayBuffer.setSize(w, h)

		this.camera.left = -w/2
		this.camera.right = w/2
		this.camera.top = h/2
		this.camera.bottom = -h/2
		this.camera.updateProjectionMatrix()

		this.overlayCamera.left = -w/2
		this.overlayCamera.right = w/2
		this.overlayCamera.top = h/2
		this.overlayCamera.bottom = -h/2
		this.overlayCamera.updateProjectionMatrix()

		this.calculateCameraOffsets(w, h)
		this.reloadOverlayThrottled()
		this.queueFrames()
	}

	queueFrames() {
		this.forceFrames = 4
	}

	pause() {
		this.active = false

		document.body.classList.remove('backdrop')
		document.body.style.background = ''

		if (window.matchMedia(StylesheetVariables.tabletMedia).matches) {
			this.rootContainer.removeEventListener('scroll', this.handleMobileScrollDebounced)
		}
	}

	resume() {
		this.active = true
		this.renderLoop()
		this.handleMobileScroll()

		document.body.classList.add('backdrop')

		if (window.matchMedia(StylesheetVariables.tabletMedia).matches) {
			this.rootContainer.addEventListener('scroll', this.handleMobileScrollDebounced)
		}
	}
}

export default (view, container, product, artworkPreload, backgroundPreload) => {
	let manager = view.backdropManager

	if (manager) {
		container.appendChild(manager.canvas)
		manager.loadNewImage(product)
		manager.resume()
	} else {
		const mobileDetect = new MobileDetect(window.navigator.userAgent)
		const canvas = createCanvas(document, container)

		manager = new BackdropManager(view, canvas, product, artworkPreload, backgroundPreload)

		function createCanvas(document, container) {
			const canvas = document.createElement(`canvas`)
			container.appendChild(canvas)

			return canvas
		}

		function bindEventListeners() {
			window.addEventListener('resize', resizeCanvas)

			resizeCanvas()
		}

		function resizeCanvas() {
			canvas.style.width = '100%'
			canvas.style.height = '100%'
			canvas.width = canvas.offsetWidth
			canvas.height = canvas.offsetHeight
			manager.resize(canvas.offsetWidth, canvas.offsetHeight)
		}

		manager.renderLoop = throttle(() => {
			manager.render()

			if (manager.active) {
				requestAnimationFrame(manager.renderLoop)
			}
		}, config.backdropRenderThrottleWait)

		bindEventListeners()
		manager.renderLoop()
	}

	return manager
}
