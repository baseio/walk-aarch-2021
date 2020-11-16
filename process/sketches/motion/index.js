import * as Motion from './motion.js'

const width = window.innerWidth // 1280
const height = window.innerHeight //720

const main = () => {
  console.log('main');

  const container = document.querySelector('#playground')
  container.style.width = `${width}px`
  container.style.height = `${height}px`

  Motion.hello()

  const nodes = []
  for(let i=0;i<70;i++){
    const elm = document.createElement('div')
    elm.className = 'circ'
    elm.setAttribute('data-id', i)
    const node = new Motion.Node(i, elm, 40, width, height)
    container.appendChild(elm)
    nodes.push(node)
  }


  // setInterval( () => {
  //   Motion.randomizePositions(width, height, nodes)
  // }, 1500)
  // Motion.randomizePositions(width, height, nodes)
}

main()

window.mode = 'bounceOfWalls'

window.setMode = (mode) => {
  console.log('setMode', mode);
  window.mode = mode
}
