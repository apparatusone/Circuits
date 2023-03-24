import { logic } from "./logic";
import { shape } from './shapes'
import { canvasCenter, cursor, origin } from "./Globals"

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { alpha: false })!;
ctx.imageSmoothingEnabled = false;
ctx.imageSmoothingQuality = 'high';

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
const andGate = new logic.AndGate(5,5);
circuit.addComponent(andGate);

let lastFrame = performance.now();
function draw() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background
    //ctx.fillStyle = color.background;
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw components
    ctx.lineWidth = z/15;
    // ctx.strokeStyle = color.line;
    ctx.strokeStyle = 'black';

    // draw objects
    ctx.lineWidth = z/15;
    // ctx.strokeStyle = color.line;
    ctx.strokeStyle = 'black';

    for (const component of circuit.components.values()) {
        shape['andGate'](component.x, component.y, ctx)
        // if (value.constructor === OnOffSwitch) {
        //     ctx.fillStyle = color.object;
        //     drawRotatedImg(value)
        //     continue
        // }

        // if (value.state) {
        //     ctx.fillStyle = value.color;
        //     drawRotatedImg(value)
        // }
        // if (!value.state) {
        //     ctx.fillStyle = color.object;
        //     drawRotatedImg(value)
        // }
    }


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

canvas.onmousemove = function(e) {
    // set cursor location in relation to the canvas
    cursor.canvas.x = Math.round((e.x / z + origin.x - 0.5) * 100) / 100;
    cursor.canvas.y = Math.round((e.y / z + origin.y - 0.5) * 100) / 100;

    // move object(s) and align to grid
    if (cursor.state.clicked && cursor.state.button === 0) {
        const rect = canvas.getBoundingClientRect();

        // get location of cursor in relation to the window scaled to the zoom level
        const delta = {
            x: (e.clientX - rect.left)/z - 0.5,
            y: (e.clientY - rect.top)/z - 0.5,
        }
        
        const object = circuit.components.get(0)
        if (object) {
            object.x = Math.round(delta.x*2)/2;
            object.y = Math.round(delta.y*2)/2;
        }
    }
}

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

canvas.onmousedown = function(e) {
    cursor.state.clicked = true;

    switch (e.button) {
        case 0:
            // main button
            cursor.state.button = 0;
            break;
        case 1:
            // middle button
            cursor.state.button = 1;
            break;
        case 2:
            // right button
            cursor.state.button = 2;
            break;
        default:
          console.log(`Unknown button code: ${e.button}`);
      }
}

canvas.onmouseup = function(e) {
    cursor.state.clicked = false;
}

// function rotate (value) {
//     ctx.save();

//     // get middle
//     let a = z/2 + value.x*z
//     let b = z/2 + -value.y*z

//     const positions = {
//         0: { x: origin.y, y: origin.x },
//         90: { x: origin.y, y: -origin.x },
//         180: { x: -origin.x, y: -origin.y },
//         270: { x: -origin.y, y: origin.x },
//     };

//     const o = positions[value.r];

//     ctx.translate(a, b)
//     ctx.rotate(value.r * -Math.PI / 180);
//     ctx.translate(-a, -b)

//     value.shape(value.x, -value.y, o.x, o.y, z, value.w, value.h, ctx, value)

//     ctx.restore();
// }