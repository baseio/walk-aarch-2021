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
	console.log('hideDrawDemo');
	let el = document.querySelector('#drawdemoContainer')
	if( el ){
		el.remove()
	}
	clearTimeout(timeout)

	playing = false
}

