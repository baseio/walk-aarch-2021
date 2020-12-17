// TODO: investigate custom build at http://fabricjs.com/build/
// import { fabric } from "../../vendor/fabric.all.js" // all things included - wont bundle :(
import { fabric } from "fabric"


/// from https://codepen.io/chriscoyier/pen/NRwANp
const DEMOS = [
  `<path d="M2,2 L8,8" />`,
  `<path d="M2,8 L5,2 L8,8" />`,
  `<path d="M2,2 Q8,2 8,8" />`,
  `<path d="M2,5 C2,8 8,8 8,5" />`,
  `<path d="M2,2 L8,2 L2,5 L8,5 L2,8 L8,8" />`,
  `<path d="M2,5 A 5 25 0 0 1 8 8" />`,
  `<path d="M2,5 S2,-2 4,5 S7,8 8,4" />`,
  `<path d="M5,2 Q 2,5 5,8" />`,
  `<path d="M2,2 Q5,2 5,5 T8,8" />`
]

const getDemoPath = (index, displaySize=200) => {

	const style = `stroke="black" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"`

	const scale = (displaySize-30)/8

	const P1 = 1 * scale
	const P2 = 2 * scale
	const P3 = 3 * scale
	const P4 = 4 * scale
	const P5 = 5 * scale
	const P6 = 6 * scale
	const P7 = 7 * scale
	const P8 = 8 * scale
	 
	const demos = [
		`<path ${style} d="M${P1},${P2} L${P8},${P8}" />`,
		`<path ${style} d="M${P1},${P8} L${P5},${P2} L${P8},${P8}" />`,
		`<path ${style} d="M${P1},${P2} Q${P8},${P2} ${P8},${P8}" />`,
		`<path ${style} d="M${P1},${P5} C${P2},${P8} ${P8},${P8} ${P8},${P5}" />`,
		`<path ${style} d="M${P1},${P2} L${P8},${P2} L${P2},${P5} L${P8},${P5} L${P2},${P8} L${P8},${P8}" />`,
		`<path ${style} d="M${P1},${P5} A ${P5} 2${P5} 0 0 1 ${P8} ${P8}" />`,
		`<path ${style} d="M${P1},${P5} S${P2},-${P2} ${P4},${P5} S${P7},${P8} ${P8},${P4}" />`,
		`<path ${style} d="M${P2},${P2} Q ${P2},${P5} ${P5},${P8}" />`,
		`<path ${style} d="M${P1},${P2} Q${P5},${P2} ${P5},${P5} T${P8},${P8}" />`
	]

	// console.log('getDemoPath', index, demos[index]);

	return demos[index]
}


let demoIndex = 0
let timeout = null

let canvas
let lastPath

let pathCreatedCallback
let userDrawSize

window.test = (index = 0, size=userDrawSize) => {
	/// https://codepen.io/wadeharrell/pen/iebdw/?editors=0010
	canvas.remove(...canvas.getObjects());

	fabric.loadSVGFromString(`<svg xmlns="http://www.w3.org/2000/svg">${getDemoPath(index)}</svg>`, (objects, options) => {

		var obj = fabric.util.groupSVGElements(objects, options);

		canvas.add(objects[0]).renderAll();

		const parser = new DOMParser();
		const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${getDemoPath(index)}</svg>`, 'image/svg+xml');
		const path = doc.querySelector('path')

		pathCreatedCallback(path)

  	})
}

export const init_userdraw = (selector, size, onPathCreated) => {

	
	pathCreatedCallback = onPathCreated
	userDrawSize = size

	let uc = document.querySelector(selector)
	uc.setAttribute('width',  `${size}px`)
	uc.setAttribute('height', `${size}px`)
	
	canvas = new fabric.Canvas(selector.replace('#',''))
	canvas.backgroundColor = '#fff';
    canvas.isDrawingMode= 1;
    canvas.freeDrawingBrush.color = '#000'
    canvas.freeDrawingBrush.width = 10 //20;
    canvas.renderAll();

    canvas.on('mouse:down', (e) => {
    	hideDrawDemo()
	    if( lastPath ){
	    	canvas.remove(...canvas.getObjects());
	    }
	});

    canvas.on('path:created', (e) => {
    	console.log('path:created');
	    lastPath = e.path;
	    
	    const svg = lastPath.toSVG()
		const parser = new DOMParser();
		const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, 'image/svg+xml');
		const path = doc.querySelector('path')
		pathCreatedCallback(path)

	});


    // demo
    setTimeout( () => {
    	showDrawDemo()
    }, 50 )}



export const showDrawDemo = () => {
	window.app.userDrawPlaying = true

	// console.log('showDrawDemo', demoIndex, '(0..8)');

	canvas.remove(...canvas.getObjects());	
	
	fabric.loadSVGFromString(`<svg xmlns="http://www.w3.org/2000/svg">${getDemoPath(demoIndex)}</svg>`, (objects, opts) => {

		canvas.add(objects[0]).renderAll();

		const parser = new DOMParser();
		const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${getDemoPath(demoIndex)}</svg>`, 'image/svg+xml');
		const path = doc.querySelector('path')
		pathCreatedCallback(path, false)
  	})

	document.querySelector('#userdraw-wrapper').addEventListener("mousedown", () => {
		// console.log('clicked #userdraw-wrapper');
		hideDrawDemo()
	})
	
	timeout = setTimeout( () => {
		if( window.app.userDrawPlaying ){
			demoIndex = ++demoIndex % DEMOS.length
			showDrawDemo()
		}
	}, 3000 )
}

export const hideDrawDemo = () => {
	// console.log('hideDrawDemo');
	
	clearTimeout(timeout)
	window.app.userDrawPlaying = false
	canvas.remove(...canvas.getObjects());
}

export const clearDrawing = () => {
	if( lastPath ){
    	canvas.remove(...canvas.getObjects());
    }
}

