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


let demoIndex = 0
let playing = false
let timeout = null

let lastPath

export const init_userdraw = (selector, size, onPathCreated) => {

	let uc = document.querySelector(selector)
	uc.setAttribute('width',  `${size}px`)
	uc.setAttribute('height', `${size}px`)
	
	var canvas = new fabric.Canvas(selector.replace('#',''))
	// canvas.backgroundColor = '#efefef';
	canvas.backgroundColor = '#fff';
    canvas.isDrawingMode= 1;
    canvas.freeDrawingBrush.color = '#000'
    canvas.freeDrawingBrush.width = 10 //20;
    canvas.renderAll();

    canvas.on('mouse:down', (e) => {
    	// hideDrawDemo()
	    if( lastPath ){
	    	canvas.remove(...canvas.getObjects());
	    }
	});

    canvas.on('path:created', (e) =>{
	    lastPath = e.path;
	    
	    const svg = lastPath.toSVG()
		const parser = new DOMParser();
		const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, 'image/svg+xml');
		const path = doc.querySelector('path')
	
		onPathCreated(path)

	});

    // demo
    setTimeout( () => {
    	showDrawDemo()
    }, 2000 )
}



export const showDrawDemo = () => {
	playing = true

	let el = document.querySelector('#drawdemoContainer')
	if( !el ){
		el = document.createElement('div')
		el.id = 'drawdemoContainer'
		document.querySelector('#userdraw-wrapper').appendChild(el)
		el.addEventListener("mousedown", () => {
			hideDrawDemo()
		})
	}

	el.innerHTML = `
		<svg viewBox="0 0 10 10">
			${DEMOS[demoIndex]}
		</svg>
	`

	const p = el.querySelector('path')
	p.setAttribute('fill', 'white')
	p.setAttribute('stroke', 'black')
	p.setAttribute('stroke-width', '0.5')

	timeout = setTimeout( () => {
		if( playing ){
			demoIndex = ++demoIndex % DEMOS.length
			// console.log('demoIndex:', demoIndex);
			showDrawDemo()
		}
	}, 3000 )
}

export const hideDrawDemo = () => {
	// console.log('hideDrawDemo');
	let el = document.querySelector('#drawdemoContainer')
	if( el ){
		el.remove()
	}
	clearTimeout(timeout)
	playing = false
}

