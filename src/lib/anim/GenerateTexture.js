
import {	
	Texture,
	SpriteMaterial,
} from 'three';

export const GenerateTexture = () => {
	const canvas = document.createElement('canvas');
	const size = 512
	canvas.width = size;
	canvas.height = size;
	const c = canvas.getContext('2d');

    c.lineWidth = 10
    c.strokeStyle = '#000';
    c.strokeStyle = '#eee';
    c.fillStyle = '#fff';
	const s = size/2;
	c.beginPath();
    c.arc(s, s, s-c.lineWidth, 0, Math.PI * 2, false);

    c.stroke();

    c.fill();
    c.closePath();

    const map = new Texture(canvas);
	map.needsUpdate = true;

	return new SpriteMaterial({
	    map: map,
	    transparent: true,
	    // useScreenCoordinates: false,
	    depthTest: false,
	    depthWrite: false,
	    color: 0xffffff
	});

}