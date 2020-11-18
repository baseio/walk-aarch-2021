import * as dat from 'dat.gui'

const gui = new dat.GUI()
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const wave = {
  length: 0,
  amplitude: 100
}

const waveFolder = gui.addFolder('wave')
waveFolder.add(wave, 'length', 0, 200)
waveFolder.add(wave, 'amplitude', 0, canvas.height/2)
waveFolder.open()


c.lineJoin = "round";

let increment = 1

function animate() {
  requestAnimationFrame(animate)

  c.fillStyle = 'floralwhite'
  c.fillRect(0, 0, canvas.width, canvas.height)

  c.beginPath()
  c.moveTo(-20, canvas.height / 2)

  for (let i = 0; i < canvas.width+20; i++) {
    const wavelength = wave.length / 1000
    const x = i
    const y = (canvas.height/2) + Math.sin(i * wavelength + increment) * wave.amplitude * Math.sin(increment)

    c.lineTo(x, y)
  }

  c.strokeStyle = '#09f'
  c.lineWidth = 10
  c.stroke()
  
  increment += 0.01
}

animate()
