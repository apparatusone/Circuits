import { color } from "./utilities.js";

const offscreen = new OffscreenCanvas(window.innerWidth, window.innerHeight);
const htx = offscreen.getContext('2d');

color.update();

export let bmp;

offScreenDraw()

export function offScreenDraw() {

    console.log('draw');
    
    // clear the canvas
    htx.clearRect(0, 0, offscreen.width, offscreen.height);

    // TODO: simplify grid generation
    // FIXME: very slow on zoom out
    //main grid
    htx.strokeStyle = color.grid;
    htx.setLineDash([]);
    htx.lineWidth = z/55;
    
    // draw grid
    if( z > 15 ) {
        for (let i = ((-origin.x - 50) * z) % z; i < offscreen.width + 50; i+=z) {
            for (let j = ((origin.y - 50) * z) % z; j < offscreen.height + 50; j+=z) {
                drawLine( ((i - z / 20) + .05*z), (j - z / 500), ((i - z / 20) + .05*z), ((j - z / 500) + z));
                drawLine( (i - z / 500), ((j - z / 20) + .05*z), ((i - z / 500) + z), ((j - z / 20) + .05*z));
            }
        }
    }

    bmp = offscreen.transferToImageBitmap();
}

function drawLine (x1, y1, x2, y2, width) {
    htx.beginPath();
    htx.moveTo(x1, y1);
    htx.lineTo(x2, y2);
    htx.stroke();
}

