// check: https://jumpoff.io/blog/implementing-boids-in-javascript-canvas
const noiseStrength = 20
const colors = ["#00aeff", "#0fa954", "#54396e", "#e61d5f"];


export const hello = () => {
  console.log('hello');
}

export const randomizePositions = (width, height, nodes) => {
  nodes.forEach(node => {
    const x = Math.random() * width
    const y = Math.random() * height
    node.setTargetPosition(x, y)
  })
}

export class Node {
  constructor(i, elm, size=20, width, height){
    this.i = i
    this.el = elm
    this.width = width
    this.height = height
    this.size = size

    this.el.style.width = `${size}px`
    this.el.style.height = `${size}px`
    this.el.style.backgroundColor = colors[i % colors.length]

    this.speed = 4
    this.slow = 0.5 // < 1
    this.noiseScale    = (350 * Math.random())

    this.x = Math.random() * width
    this.y = Math.random() * height
    this.tx = 0
    this.ty = 0
    this.vx = 1
    this.vy = 1

    this.dx = -this.speed + Math.random() * this.speed * 2
    this.dy = -this.speed + Math.random() * this.speed * 2
    this.tx = this.dx
    this.ty = this.dy

    this.angle = 0

    _nodes.push( this )

    this.el.style.left = `${this.x}px`
    this.el.style.top  = `${this.y}px`
  }

  setTargetPosition(x, y){
    this.tx = x
    this.ty = y
    // this.vx = 1
    // this.vy = 1

    // var mag = Math.random() * 30 + 30;
    // var angle = Math.random() * Math.PI * 2;
    // this.vx = Math.cos(angle) * mag;
    // this.vy = Math.sin(angle) * mag;
    // this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);
    // console.log(this.angle);
  }

  update(){

    this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);

    // Perlin
    //this.angle = noise(this.x / this.noiseScale, this.y / this.noiseScale) * noiseStrength


    this.vx *= this.slow
    this.vy *= this.slow
    // this.x += -Math.cos(this.angle) * this.speed + this.vx
    // this.y += -Math.sin(this.angle) * this.speed + this.vy

    // this.x += Math.cos(this.angle) * this.speed * this.vx
    // this.y += Math.sin(this.angle) * this.speed * this.vy

    // Lerp towards tx,ty
    // this.x = this.tx - (this.tx - this.x) * 0.9
    // this.y = this.ty - (this.ty - this.y) * 0.9

    // Collide with other nodes
    _nodes.forEach( (node,i) => {
      if( i != this.i ){
        const n = _nodes[i]
        const c = checkCollision(this.x, this.y, this.size/2, n.x, n.y, n.size/2)
        if( c ){
          //console.log('collide', this.i, n.i);
          this.dx = - this.dx;
          this.dy = - this.dy

          n.dx = - n.dx;
          n.dy = - n.dy

          this.speed ++ //= 2 + Math.random() * 9
          // const a = 2
          // // this.vx = a
          // // this.vy = a
          // n.vx = a
          // n.vy = a
        }
      }
    })

    // this.dx += this.vx
    // this.dy += this.vy


    // Bounce of walls
    if( window.mode == 'bounceOfWalls' ){
      if( this.x + this.dx > this.width|| this.x + this.dx < 0 ){
        this.dx = - this.dx;
      }
      if( this.y + this.dy > this.height || this.y + this.dy < 0 ){
        this.dy = - this.dy
      }
    }

    // Wrap around
    if( window.mode == 'wrapAround' ){
      if(this.x < 0) this.x = this.width
      if(this.x > this.width) this.x = 0
      if(this.y < 0) this.y = this.height
      if(this.y > this.height) this.y = 0
    }


    this.x += this.dx
    this.y += this.dy


    this.el.style.left = `${this.x}px`
    this.el.style.top  = `${this.y}px`
  }

}

// https://stackoverflow.com/questions/8331243/circle-collision-in-javascript
const checkCollision = (p1x, p1y, r1, p2x, p2y, r2) => ((r1 + r2) ** 2 > (p1x - p2x) ** 2 + (p1y - p2y) ** 2)


//

let _nodes = []

const update = () => {
  requestAnimationFrame(update)
  _nodes.forEach( node => node.update() )
}

update()
