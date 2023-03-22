import { logic } from "./logic";
import { canvasCenter, cursor, origin } from "./Globals"

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas?.getContext("2d", { alpha: false });
if (ctx) {
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'high';
}

// Start listening to resize events and redraw canvas
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas()
function resizeCanvas() {
    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    //const scale = 1;
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
}

// instantiate logic
const circuit = new logic.Simulate();
const andGate = new logic.AndGate();
circuit.addComponent(andGate);

console.log(circuit);


let lastFrame = performance.now();
function draw() {
    // clear the canvas
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background
    //ctx.fillStyle = color.background;
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw components
    ctx.lineWidth = z/15;
    // ctx.strokeStyle = color.line;
    ctx.strokeStyle = 'black';

    // test object
    ctx.fillStyle = 'black'
    ctx.fillRect(500, 500, z*1.5, z);


    // Smooth Zoom transistion
    // if(settings.smoothZoom) {
    if (true) {
        origin.x += cursor.screen.x * (1 / z - 5 / (smoothZoom + 4 * z));
        origin.y -= cursor.screen.y * (1 / z - 5 / (smoothZoom + 4 * z));
        z = z - (z - smoothZoom) / 5
    } else {
        origin.x = (origin.x + cursor.screen.x * (1 / z - 1 / (smoothZoom)));
        origin.y = (origin.y - cursor.screen.y * (1 / z - 1 / (smoothZoom)));
        z = smoothZoom;
    };

    if(!lastFrame) {
        lastFrame = performance.now();
        // fps = 0;
        return;
    };

    lastFrame = performance.now();
    //fps = 1/((performance.now() - lastFrame)/1000);

    window.requestAnimationFrame(draw);
}

draw();

canvas.onwheel = function(e) {
    e.preventDefault();

    cursor.screen.x = e.x;
    cursor.screen.y = e.y;

    // TODO: MAKE READABLE
    smoothZoom = Math.min( Math.max(smoothZoom - (z/8) * ((e.deltaY) > 0 ? .3 : -.5),
        //minimum zoom / maximum zoom      
            15), 300
    );

    // level of current zoom in action (top) menu
    const zoomLevelElement = document.getElementById("zoomlevel");
    if (zoomLevelElement) {
      zoomLevelElement.innerHTML = Math.round(z) + '%';
    } else {
      console.error("Element with ID 'zoomlevel' not found.");
    }

    return false;
}