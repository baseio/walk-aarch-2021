
import {	
	Texture,
	SpriteMaterial,
} from 'three';

export const GenerateTexture = (stroke='#eee', fill='#fff', lineWidth=10) => {
	
	const canvas = document.createElement('canvas');
	const size = 512
	canvas.width = size;
	canvas.height = size;
	const c = canvas.getContext('2d');

    c.lineWidth   = lineWidth 	// 10
    c.strokeStyle = stroke // '#eee';
    c.fillStyle   = fill   // '#fff';
	
	const s = size/2;
	c.beginPath();
    c.arc(s, s, s-c.lineWidth, 0, Math.PI * 2, false);
    // c.arc(s, s, s-(c.lineWidth*0.9), 0, Math.PI * 2, false);
    c.fill();
    c.stroke();
    c.closePath();

    const map = new Texture(canvas);
	map.needsUpdate = true;

	return map

	// return new SpriteMaterial({
	//     map: map,
	//     transparent: true,
	//     depthTest: false,
	//     depthWrite: false,
	//     color: 0xffffff
	// });

}