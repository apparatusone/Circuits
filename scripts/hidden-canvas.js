import { color } from "./utilities.js";

const offscreen = new OffscreenCanvas(window.innerWidth, window.innerHeight);
const htx = offscreen.getContext('2d');
export let bmp;

color.update();

offScreenDraw()

export function offScreenDraw() {

    console.log('draw');
    
    // clear the canvas
    htx.clearRect(0, 0, offscreen.width, offscreen.height);

    //main grid
    htx.strokeStyle = color.grid;
    htx.setLineDash([]);
    htx.lineWidth = z/55;

    if ( z > 15 ) {
        for (let j = ((origin.y - 50) * z) % z; j < offscreen.height + 50; j+=z) {
            drawLine( 0, ((j - z / 20) + .05*z), offscreen.width, ((j - z / 20) + .05*z));
        }
    }

    if ( z > 15 ) {
        for (let i = ((-origin.x - 50) * z) % z; i < offscreen.width + 50; i+=z) {  
            drawLine( ((i - z / 20) + .05*z), 0, ((i - z / 20) + .05*z), offscreen.height);
        }
    }

    bmp = offscreen.transferToImageBitmap();
}

function drawLine (x1, y1, x2, y2) {
    htx.beginPath();
    htx.moveTo(x1, y1);
    htx.lineTo(x2, y2);
    htx.stroke();
}

