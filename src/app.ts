import * as Type from './types/types'
import { Logic } from "./logic";
import { shape } from './shapes'
import { within, rotateCoordinate } from "./utilites";
import { cursor, origin, selected } from "./Globals"
import { bmp, offScreenDraw, offscreen } from "./gridcanvas"
import { Binary, ComponentType } from "./types/types";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { alpha: false })!;
ctx.imageSmoothingEnabled = false;
ctx.imageSmoothingQuality = 'high';

// Start listening to resize events and redraw canvas
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();
function resizeCanvas() {
    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    //const scale = 1;
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
    offscreen.width = Math.floor(window.innerWidth * scale);
    offscreen.height = Math.floor(window.innerHeight * scale);
    offScreenDraw();
}

// instantiate Logic
export const circuit = new Logic.Simulate();

const trinand1 = new Logic.NandGate(1,0,0,3)
trinand1.r = 90
circuit.addComponent(trinand1)

const trinand2 = new Logic.NandGate(1,2,0,3)
trinand2.r = 90
circuit.addComponent(trinand2)


let lastFrame:number = performance.now();
function draw() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background
    //ctx.fillStyle = color.background;
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // update offscreen canvas if zooming or cursor is clicked
    if (Math.abs(z - smoothZoom) > .01 || cursor.state.isClicking) {
        offScreenDraw()
    }

    // draw hidden canvas
    ctx.drawImage(bmp,0,0);

    // draw components
    ctx.lineWidth = z/15;
    ctx.strokeStyle = 'black';
    for (const component of circuit.components.values()) {
        drawComponent(component);
        drawNodes(component);
    }

    // draw connections
    for ( const {a,b} of circuit.connectionCoordinates) {
        ctx.lineCap = 'round';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo((origin.x + a.x + 0.5)* z, (origin.y - a.y + 0.5) * z);
        ctx.lineTo((origin.x + b.x + 0.5)* z, (origin.y - b.y + 0.5) * z);
        ctx.stroke();
    }

    // draw 'drawing' line
    if (cursor.state.isDrawing) {
        const component = selected.node.component;
        const node = component.nodes[selected.node.nodeName];

        const rotated = rotateCoordinate( {x: node.x, y: node.y}, component.r)
        const c = {
            x: component.x + rotated.x,
            y: component.y + rotated.y,
        }

        ctx.beginPath();
        ctx.moveTo((origin.x + c.x + 0.5)* z, (origin.y - c.y + 0.5) * z);
        ctx.lineTo(cursor.window.current.x, cursor.window.current.y);
        ctx.stroke();
    }

    // Smooth Zoom transistion
    // if(settings.smoothZoom) {
    if (true) {
        origin.x -= cursor.window.current.x * (1 / z - 5 / (smoothZoom + 4 * z));
        origin.y -= cursor.window.current.y * (1 / z - 5 / (smoothZoom + 4 * z));
        z = z - (z - smoothZoom) / 5
    } else {
        // origin.x = (origin.x + cursor.screen.x * (1 / z - 1 / (smoothZoom)));
        // origin.y = (origin.y - cursor.screen.y * (1 / z - 1 / (smoothZoom)));
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

canvas.onmousedown = function(e) {
    cursor.state.isClicking = true;
    
    // clear selected array
    selected.component = [];

    // store cursor click coordinates relative to the window
    cursor.window.previous = { x: e.x, y: e.y };

    // store previous origin position
    origin.previous = { x: origin.x, y: origin.y };

    // loop through components to find the component under the cursor and store it in selected array
    circuit.components.forEach((obj: Type.ComponentType) => {
        if ( within.rectangle( { x:obj.x, y:obj.y }, 1, 1, cursor.canvas.current)) {
            selected.component.push(obj);
        };
    });

    // if a node was clicked start drawing a connection
    circuit.components.forEach((component: Type.ComponentType) => {
        for (const [node, coordinate] of Object.entries<Type.Coordinate>(component.nodes)) {
            const rotated = rotateCoordinate( {x: coordinate.x, y: coordinate.y}, component.r)
            const c = {
                x: component.x + rotated.x,
                y: component.y + rotated.y,
            }
            if ( within.circle( { x: c.x, y: c.y }, .08, cursor.canvas.current)) {
                cursor.state.isDrawing = true;
                // clear selected array
                selected.component = [];
                // store node
                selected.node = { component: component, nodeName: node };
            }
        }
    });

    // store current position of all selected components
    selected.component.forEach(component => {
        component.prevPosition = { x: component.x, y: component.y };
    });

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
    cursor.state.isClicking = false;

    // if the selected component is an input
    if ( selected.component.length === 1 && selected.component[0].name === 'input' ) {
        const input = selected.component[0] as InstanceType<typeof Logic.Input>
        // if the selected component hasn't moved toggle it's state
        if (input.x === input.prevPosition.x && input.y === input.prevPosition.y) {
            input.setOutput(1 - input.state as Binary);
            circuit.propogate();
        }
    }

    // if drawing a connection and a node is under the cursor, create a new connection
    if (cursor.state.isDrawing) {
        const { component:obj_a, nodeName:node_a } = selected.node;
        circuit.components.forEach( (obj_b: Type.ComponentType) => {
            for (const [node_b, coordinate] of Object.entries<Type.Coordinate>(obj_b.nodes)) {
                const rotate_a = rotateCoordinate( {x: coordinate.x, y: coordinate.y}, obj_b.r)
                const c = {
                    x: obj_b.x + rotate_a.x,
                    y: obj_b.y + rotate_a.y,
                }
                if ( within.circle( { x: c.x, y: c.y }, .08, cursor.canvas.current)) {
                    circuit.addConnection(obj_a, node_a, obj_b, node_b)
                    circuit.propogate();

                    selected.node.component = null;
                    selected.node.nodeName = null;
                }
            }
        });
        cursor.state.isDrawing = false;
    }
    // clear selected array
    selected.component = [];
}

canvas.onmousemove = function(e) {
    // store cursor coordinates relative to the window
    cursor.window.current = { x: e.x, y: e.y };

    // get the change in position
    let delta = {
        x: cursor.canvas.previous.x - cursor.canvas.current.x,
        y: cursor.canvas.previous.y - cursor.canvas.current.y,
    };

    // move canvas
    if (cursorConditions.moveCanvas) {
        origin.x = origin.previous.x - delta.x;
        origin.y = origin.previous.y + delta.y;
    };

    // loop through selected array and update component positions
    if (cursorConditions.moveComponent) {
        selected.component.forEach(obj => {
            obj.x = obj.prevPosition.x - Math.round(delta.x*2)/2;
            obj.y = obj.prevPosition.y - Math.round(delta.y*2)/2;
    });

        // update the connection coordinates to draw connections
        circuit.updateCoordinates();
    }
}

canvas.onwheel = function(e) {
    e.preventDefault();
    // store cursor coordinates relative to the window
    cursor.window.current = { x: e.x, y: e.y };

    smoothZoom = Math.min( Math.max( smoothZoom - (z/8) * ((e.deltaY) > 0 ? .3 : -0.5), 15), 300 );

    // level of current zoom displayed in action bar
    const zoomLevelElement = document.getElementById("zoomlevel");
    if (zoomLevelElement) {
        zoomLevelElement.innerHTML = Math.round(z) + '%';
    } else {
        console.error("Element with ID 'zoomlevel' not found.");
    }

    return false;
}

function drawComponent (component:ComponentType):void {
    ctx.save();
    let rotation = { x: origin.x, y:origin.y }

    // rotate component
    if (component.r !== 0) {
        const middle = {
            x: z/2 + component.x*z,
            y: z/2 - component.y*z
        }

        rotation = rotateCoordinate( {x:origin.x, y:origin.y}, component.r)

        ctx.translate(middle.x, middle.y)
        ctx.rotate(component.r * Math.PI / 180);
        ctx.translate(-middle.x, -middle.y)
    }

    // draw component
    shape[component.name](component, rotation, ctx)
    ctx.restore();
}

function drawNodes(component:ComponentType):void {
    for (const coordinates of Object.values(component.nodes) as Type.Coordinate[] ) {
        // rotate node coordinates with component
        const rotated = rotateCoordinate( {x:coordinates.x, y:coordinates.y}, component.r)
        const x = component.x + rotated.x;
        const y = component.y + rotated.y;
        const r = 5.5;

        ctx.lineWidth = z/20;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
    
        // draw circle
        ctx.beginPath();
        ctx.arc((origin.x + x + 0.5) * z, (origin.y - y + 0.5) * z, r/100*z, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }
};

const cursorConditions = {
    get moveCanvas() {
        return !selected.component.length && 
                cursor.state.isClicking && 
                cursor.state.button === 0 &&
                !cursor.state.isDrawing
    },
    get moveComponent() {
        return  selected.component.length && 
                cursor.state.isClicking && 
                cursor.state.button === 0
    },
};
