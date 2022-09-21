'use strict';

import { Wire, TempLine, Node, Led, OnOffSwitch, make, CustomComponent, Clock, ConstantHigh } from "./parts.js"

import { shape } from "./shapes.js"
//import { mdiPlus, mdiMinus, mdiUndoVariant, mdiSelection, mdiContentSave, } from "../node_modules/@mdi/js/mdi.js";
import { mdiPlus, mdiMinus, mdiUndoVariant, mdiSelection, mdiContentSave, mdiCloseCircle, mdiCog, dltRotate, mdiChevronRight } from './shapes.js';
import { within, drawShape, generateId, stringIncludes, minMax, slope, capitalize, getClass, color,
     radians, buildComponent, makeCustomComponent, deleteComponent, deleteWire, addMdi, pointOnLine,
     mouseClickDuration, formatBytes, delay, easeInOutCirc } from "./utilities.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });

ctx.imageSmoothingEnabled = false;
ctx.imageSmoothingQuality = 'high';

// Start listening to resize events and draw canvas.
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas()
function resizeCanvas() {
    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    //const scale = 1;
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
}

const rotateLeft = document.getElementById("rotate-left");
const rotateRight = document.getElementById("rotate-right");
const deleteButton = document.getElementById("delete");
const settingsButton = document.getElementById("settings");
const settingsMenu = document.getElementById("settings-menu");
const darkModeBox = document.getElementById("menu-darkmode");
const showLabelsBox = document.getElementById("menu-show-labels");
const customComponentButton = document.getElementById("custom-component");
const nameButton = document.getElementById("name-component");
const saveComponentButton = document.getElementById("save-component");
const rightClickMenu = document.getElementById("right-click");
const nameFormContainer = document.getElementById("name-form-container");

rightClickMenu.addEventListener("click", toggleRightClickMenu, false);

addMdi(mdiCog,settingsButton, color.icon, 24, 24, 'post-icon')
addMdi(dltRotate,rotateLeft, color.rotate, 100, 35, 'rotate')
addMdi(dltRotate,rotateRight, color.rotate, 100, 35, 'rotate')

// default zoom
window.z = 200;
let smoothZoom = z;

//TODO: REFACTOR
//global conditions
let dragging = false;
let drawing = false;
let mouseDown = false;
//let rightClick = false;

const select = {
    //currently using selection tool
    action: false,
    //selected (highlighted) components and nodes
    components: [],
    nodes: [],
}

const clicked = {
    state: false,
    isComponent: false,
    isNode: false,
    isWire: false,
    isLabel: false,
    object: undefined,
    node: undefined,
    wire: undefined,
};

// update selection on change
const clickedProxy = new Proxy(clicked, {
    set: function (target, key, value) {
        target[key] = value;
        selectedComponents()
        return true;
    }
})

window.settings = {
    //settings menu is open
    open: false,
    smoothZoom: true,      
    // increment that buttons change zoom level                             
    zoomButtons: 5,
    darkMode: false,      
    showLabels: false,                           
};

// timer for mouse click duration
const timer = {
    start: 0,
    end: 0
}

const canvasCenter = {
    x: - Number.parseFloat((window.innerWidth/(z*2)).toFixed(3)) + 0.5,
    y: Number.parseFloat((window.innerHeight/(z*2)).toFixed(3)) - 0.5
}

//set origin to center of screen
window.origin = {                                         
    x: canvasCenter.x,
    y: canvasCenter.y,
    click: { x:0, y:0 },
    prev: { x:0, y:0 },                      
};

// location of cursor
window.mouse = {
    screen: { x: 0, y: 0 },
    canvas: { x: 0, y: 0 },
    cell: {x: 0, y: 0},
    //offset for moving multiple objects
    moveOffset: {components: [], nodes: []}
};

window.objects = {};            // components
window.wires = {};              // visual representation of links
window.savedComponents = {}
window.copy = {}

//TODO: REFACTOR
let drawingLine = []         // line shown when drawing connection
let drawingRect = []

//load from localstorage
loadSave()
//set gui colors
color.update()

if (localStorage.length < 2) tutorial()

function tutorial() {
    make.led(0,2,0)
    make.and(0,0,0)
    make.switch(-1,-2,0)
    make.switch(1,-2,0)
    make.label(1,0,0)
    make.label(-1.5,-1,0)
    make.label(2,-3,0)
    objects[3].changeState
    //objects[4].changeState
    objects[5].name = 'And Gate'
    objects[6].name = 'Connect remaining nodes'
    objects[7].name = 'Click on switch to change state from 0 to 1'
    temp(objects[4], 'output', objects[2], 'input2')
    temp(objects[2], 'output', objects[1], 'input')

    function temp(obj1, node1, obj2, node2) {
        let node = {a: obj1[node1], b:obj2[node2]}

        let id = generateId()
        let wire = new Wire( { a: node.a, b: node.b } );

        wires[id] = wire
        wires[id].id = id

        node.a.connected = true;
        node.b.connected = true;
        // set id for wire connected to node
        node.a.wireId = id;
        node.b.wireId = id;
        wires[id].state
    }
}

//let fps;
let lastFrame = performance.now();

function draw() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background
    ctx.fillStyle = color.background;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // if( z > 40 ) {
    //     for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) { //
    //         for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
    //             ctx.drawImage(gridDot, i - z / 12, j - z / 12, z / 6, z / 6);
    //         };
    //     };
    // };

    // more effecient to render when zoomed out
    //ctx.fillStyle = "rgba(0,0,0," + Math.min(1, z / 20) + ")";

    // let i;
    // for (i = (-origin.x * z) % z; i < canvas.width; i+=z) {
    //     //ctx.fillRect(i - z / 40, j - z / 40, z / 20, z / 20);
    // };

    // for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
    //     ctx.fillRect(i - z / 40, j - z / 40, z / 20, z / 20);
    // };

    // if ( z < 40 ) {
    //     ctx.fillStyle = "rgba(0,0,0," + Math.min(1, z / 20) + ")";
    //     for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) {
    //         for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
    //             ctx.fillRect(i - z / 40, j - z / 40, z / 20, z / 20);
    //         };
    //     };
    // }

    // TODO: simplify grid generation
    // FIXME: very slow on zoom out
    //main grid
    // if( z > 15 ) {
    //     for (let i = ((-origin.x - 50) * z) % z; i < canvas.width + 50; i+=z) {
    //         for (let j = ((origin.y - 50) * z) % z; j < canvas.height + 50; j+=z) {
    //             ctx.strokeStyle = color.grid;
    //             ctx.setLineDash([]);
    //             // x1,y1, x2, y2, linewidth
    //             drawLine( ((i - z / 20) + .05*z), (j - z / 500), ((i - z / 20) + .05*z), ((j - z / 500) + z), 55);
    //             drawLine( (i - z / 500), ((j - z / 20) + .05*z), ((i - z / 500) + z), ((j - z / 20) + .05*z), 55);
    //         }
    //     }
    // }

    //DOESN'T cause slow down on zoom out
    //sub grid
    if( z > 40 ) {
        for (let i = ((-origin.x - 50) * z) % z; i < canvas.width + 50; i+=z) {
            for (let j = ((origin.y - 50) * z) % z; j < canvas.height + 50; j+=z) {
                ctx.strokeStyle = 'rgba(0,0,0,.1)';
                ctx.setLineDash([0, .14*z]);
                ctx.lineDashOffset = z/.2061;
                ctx.lineCap = 'round';
                // 1.82 approx offset for subgrid
                drawLine ((i - z / 1.82) + .05*z, (j - z / 1.82), (i - z / 1.82) + .05*z, (j - z / 1.82) + z, 35)
                drawLine ((i - z / 1.82), (j - z / 1.82) + .05*z, (i - z / 1.82) + z, (j - z / 1.82) + .05*z, 35)
            }
        }
    }


    // X @ center of canvas
    ctx.lineWidth = z/60;
    ctx.strokeStyle = '#6F6F6F';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo((-origin.x - .1 + 0.5)* z, (origin.y + .1 + 0.5) * z, z, z);
    ctx.lineTo((-origin.x + .1 + 0.5)* z, (origin.y - .1 + 0.5) * z, z, z);
    ctx.moveTo((-origin.x - .1 + 0.5)* z, (origin.y - .1 + 0.5) * z, z, z);
    ctx.lineTo((-origin.x + .1 + 0.5)* z, (origin.y + .1 + 0.5) * z, z, z);
    ctx.stroke();

    // draw highlight
    ctx.lineCap = 'round';
    for (let [key, value] of Object.entries(objects)) {
        if (value.highlight === true) {
            if (value.img !== 'svg') {
                ctx.lineWidth = z/4;
                ctx.strokeStyle = '#00B6FF';
                ctx.lineJoin = 'round';
                ctx.setLineDash([]);
                ctx.fillStyle = '#00B6FF';
                drawRotatedImg(value, value.shape, value.w, value.h)

            }
            ctx.stroke();
        }
    }

    for (let [key, value] of Object.entries(wires)) {
        if (value.highlight === true) {
            ctx.strokeStyle = '#00B6FF';
            ctx.lineWidth = z/5;
            drawWire(value)
        }
    }
    
    // draw wires
    for (let [key, value] of Object.entries(wires)) {
        ctx.setLineDash([]);
        ctx.lineJoin = 'round';
        if (value.storeState) ctx.strokeStyle = color.lineHigh
        if (!value.storeState) ctx.strokeStyle = color.lineLow
        ctx.lineWidth = z/20;
        drawWire(value)
    }
    

    // draw objects
    for (let [key, value] of Object.entries(objects)) {
        ctx.strokeStyle = color.line;
        ctx.lineWidth = z/15;
        if (value.constructor === OnOffSwitch) {
            ctx.fillStyle = color.object;
            drawRotatedImg(value)
            continue
        }

        if (value.state) {
            ctx.fillStyle = value.color;
            drawRotatedImg(value)
        }
        if (!value.state) {
            ctx.fillStyle = color.object;
            drawRotatedImg(value)
        }
    }

    // FIXME: rotate multiple components 
    // show rotate buttons on selected component

    if (select.components.length < 2 && clickedProxy.isComponent ) {
        locateRotateButtons(clickedProxy.object);
    }
    if (z < 55) {
        rotateButtons('hide')
    }


    //FIXME:
    drawNodeHighlight()

    // draw custom component
    for (let [key, value] of Object.entries(objects)) {
        if (value.constructor === CustomComponent) {

            // Name of Component
            let fontSize = z/10
            ctx.fillStyle = 'white'
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center'
            ctx.baseline = 'middle'
            ctx.strokeStyle = 'black';
            ctx.lineWidth = z/120;

            let x = (-origin.x + .5 + value.x) * z
            let y = (origin.y + .53 - value.y) * z
            let degrees = value.r - 90
            //prevent text from being upside down
            if (value.r === 270) degrees = 0

            ctx.save();
            ctx.translate((-origin.x + .5 + value.x) * z, (origin.y + .5 - value.y) * z)
            ctx.rotate(degrees * -Math.PI / 180);
            ctx.translate(-(-origin.x + .5 + value.x) * z, -(origin.y + .5 - value.y) * z)
            ctx.fillText(value.name, x, y);
            ctx.restore();

            //draw pins
            for (let [key, off] of Object.entries(value.offset)) {
                //location of pins
                let side = ['left', 'right']
                let s = Math.min(1, radians(value.r) % Math.PI)
                let pinOffset = { x: .205, y: 0 }
                if (value.r === 0 || value.r === 180) {
                    if (value.r === 180) s ^= 1;
                    if (off.x > 0) pinOffset.x*= -1;
                    if (off.x > 0) s ^= 1;
                } else {
                    pinOffset = { x: 0, y: .205 }
                    if (value.r === 270) s ^= 1;
                    if (off.y > 0) pinOffset.y*= -1;
                    if (off.y < 0) s ^= 1;
                }

                let x = (-origin.x + (off.x + pinOffset.x + value.x) + 0.465) * z;
                let y = ( origin.y + (-off.y - pinOffset.y - value.y) + .425 ) * z;
                let w = .07*z
                let h = .15*z

                ctx.save();
                ctx.translate(x + w/2, y + h/2)
                ctx.rotate(value.r * -Math.PI / 180);
                ctx.translate(-(x + w/2), -(y + h/2))
                
                ctx.fillStyle = '#969696'
                shape.pins (x, y, w, h, z, side[s], ctx)

                ctx.restore();
            }

            if (!value.highlight && !settings.showLabels) continue
            //draw labels
            for (let [key, off] of Object.entries(value.offset)) {

                let invert = 1
                if  (off.x < 0 && (value.r === 0 || value.r === 180)) invert = -1;
                if  (off.y < 0 && (value.r === 90 || value.r === 270)) invert = -1;

                
                let textWidth = ctx.measureText(key).width;
                let width = invert * (textWidth*1.2 + z/4)
                let height = invert * (z/6)
                let radius =  invert * .09

                let offset = { x: .085, y: - height/2/z}
                if (value.r === 0 || value.r === 180) {
                    if (off.x < 0) offset.x *= -1;
                } 

                if (value.r === 90 || value.r === 270) {
                    offset = { x: width/2/z, y: -width/2/z}
                }

                let x = (-origin.x + .5 + off.x - offset.x + value.x ) * z
                let y = ( origin.y + .5 - off.y + offset.y - value.y ) * z

                ctx.save();
                ctx.translate(x + width/2, y + height/2)
                ctx.rotate(value.r * -Math.PI / 180);
                ctx.translate(-(x + width/2), -(y + height/2))

                ctx.fillStyle = 'black'
                ctx.strokeStyle = 'white';
                ctx.lineWidth = z/50;

                shape.roundRectangle( x, y, width, height, 
                    {upperLeft: radius*z, upperRight: radius*z, lowerLeft: radius*z, lowerRight: radius*z},
                    true, true, ctx)

                let fontSize = z/9
                ctx.fillStyle = 'white'
                ctx.font = `${fontSize}px sans-serif`;

               // draw label text
                if (value.r === 0) {
                    ctx.baseline = 'alphabetic'
                    if (off.x > 0) {
                        ctx.textAlign = 'left'
                        ctx.fillText( key, x + .17*z , y + height/2 + .04*z);
                    } else {
                        ctx.textAlign = 'right'
                        ctx.fillText( key, x - .17*z , y + height/2 + .04*z);
                    }
                } 

                if (value.r === 90) {
                    ctx.baseline = 'alphabetic'
                    if (off.y > 0) {
                        ctx.textAlign = 'left'
                        ctx.fillText( key, x + .17*z , y + height/2 + .04*z);
                    } else {
                        ctx.textAlign = 'right'
                        ctx.fillText( key, x - .17*z , y + height/2 + .04*z);
                    }
                } 

                if (value.r === 270) {
                    ctx.baseline = 'alphabetic'
                    if (off.y > 0) {
                        ctx.textAlign = 'left'
                        ctx.fillText( key, x + .05*z , y + height/2 + .04*z);
                    } else {
                        ctx.textAlign = 'right'
                        ctx.fillText( key, x - .05*z , y + height/2 + .04*z);
                    }
                } 
                ctx.restore();

                if (value.r === 180) {
                    let fontSize = z/9
                    ctx.fillStyle = 'white'
                    ctx.font = `${fontSize}px sans-serif`;
                    
                    ctx.baseline = 'alphabetic'
                    if (off.x > 0) {
                        ctx.textAlign = 'left'
                        ctx.fillText( key, x + .17*z , y + height/2 + .04*z);
                    } else {
                        ctx.textAlign = 'right'
                        ctx.fillText( key, x - .17*z , y + height/2 + .04*z);
                    }
                }
            }
        }
    }

    drawNodes()

    // draw selection rectangle
    if (select.action && drawingRect.length) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = color.line;
        ctx.lineCap = 'square';
        ctx.setLineDash([5,15]);
        ctx.beginPath();
        ctx.moveTo(drawingRect[0].x, drawingRect[0].y);
        ctx.lineTo(drawingRect[0].x + drawingRect[0].w, drawingRect[0].y);
        ctx.lineTo(drawingRect[0].x + drawingRect[0].w, drawingRect[0].y + drawingRect[0].h);

        ctx.moveTo(drawingRect[0].x, drawingRect[0].y);
        ctx.lineTo(drawingRect[0].x, drawingRect[0].y + drawingRect[0].h);
        ctx.lineTo(drawingRect[0].x + drawingRect[0].w, drawingRect[0].y + drawingRect[0].h);

        ctx.stroke();
    }

    // new wire line
    if (drawingLine.length > 0) {
        ctx.strokeStyle = color.line;
        drawTempWire(drawingLine[0])
    }

    //Smooth Zoom transistion
    if(settings.smoothZoom) {
        origin.x += mouse.screen.x * (1 / z - 5 / (smoothZoom + 4 * z));
        origin.y -= mouse.screen.y * (1 / z - 5 / (smoothZoom + 4 * z));
        z = z - (z - smoothZoom) / 5;
    } else {
        origin.x = (origin.x + mouse.screen.x * (1 / z - 1 / (smoothZoom)));
        origin.y = (origin.y - mouse.screen.y * (1 / z - 1 / (smoothZoom)));
        z = smoothZoom;
    };

    if(!lastFrame) {
        lastFrame = performance.now();
        fps = 0;
        return;
        };

    lastFrame = performance.now();
    //fps = 1/((performance.now() - lastFrame)/1000);

    window.requestAnimationFrame(draw);
}

draw();



canvas.onmousemove = function(e) {
    mouse.canvas.x = Number.parseFloat((e.x / z + origin.x) - .5).toFixed(2);
    mouse.canvas.y = Number.parseFloat((-e.y / z + origin.y) + .5).toFixed(2);

    //TODO: REFACTOR
    // move canvas
    if (mouseDown && !dragging && !drawing && !select.action && !clicked.isLabel) {
        origin.x = origin.prev.x + (origin.click.x - e.x)/z;
        origin.y = origin.prev.y - (origin.click.y - e.y)/z;
    };

    //move label
    if (mouseDown && clicked.isLabel === true) {
        const id = clicked.object.id
        const name = clicked.object.name
        const x = objects[id].x
        const y = objects[id].y

        // move label within range
        if  (objects[id].r === 0 || objects[id].r === 180) {
            objects[id].offset[name].y = Math.max( -objects[id].h/2 + .15, Math.min(objects[id].h/2 - .15, parseFloat(mouse.canvas.y) - y))
        }
        if  (objects[id].r === 90 || objects[id].r === 270) {
            objects[id].offset[name].x = Math.max( - objects[id].h/2 + .15, Math.min(objects[id].h/2 - .15, parseFloat(mouse.canvas.x) - x))
        }

        moveLabels(id,name)
        return
    }

    // move node
    if (clickedProxy.node && mouseDown && dragging && !drawing ) {
        clickedProxy.node.x = Math.round(mouse.canvas.x*4)/4;
        clickedProxy.node.y = Math.round(mouse.canvas.y*4)/4;
        return
    }

    // move object(s)
    if (mouseDown && dragging && !drawing) {
        let highlighted = select.components
        let delta = {
            x:(origin.click.x / z) + origin.x - 0.5 - parseFloat(mouse.canvas.x),
            y:(-origin.click.y / z) + origin.y + 0.5 - parseFloat(mouse.canvas.y)
        }

        // if mulitple objects
        if (highlighted.length > 1) {
            for (const part of mouse.moveOffset.components) {
                objects[part.id].x = part.x + -1 * Math.round(delta.x*2)/2
                objects[part.id].y = part.y + -1 * Math.round(delta.y*2)/2
            }
            for (const node of mouse.moveOffset.nodes) {
                wires[node.wireId].nodes[node.index].x = node.x + -1 * Math.round(delta.x*2)/2
                wires[node.wireId].nodes[node.index].y = node.y + -1 * Math.round(delta.y*2)/2
            }
            return
        }

        clickedProxy.object.x = Math.round(mouse.canvas.x*2)/2;
        clickedProxy.object.y = Math.round(mouse.canvas.y*2)/2;
    }

    if (drawing === true) {
        drawingLine[0].x2 = (e.x / z - 0.5) + origin.x
        drawingLine[0].y2 = (-e.y / z + 0.5) + origin.y
    }

    if (mouseDown) {
        //detectWireIntersection()
    }

    if (select.action && drawingRect.length) {
        drawingRect[0].w = e.x - origin.click.x
        drawingRect[0].h = e.y - origin.click.y
        const x1 = (origin.click.x / z + origin.x) - 0.5
        const y1 = (-origin.click.y / z + origin.y) + 0.5

        // get objects within selected rectangle
        for (let [key, value] of Object.entries(objects)) {

            value.highlight = false;
            for (const node of value.nodes) {
                if (value[node].wireId !== undefined) {
                    wires[value[node].wireId].highlight = false

                } 
            }

            if (!((x1 - value.x) * (mouse.canvas.x - value.x) <= 0)) continue
            if (!((y1 - value.y) * (mouse.canvas.y - value.y) <= 0)) continue

            value.highlight = true
            //highlight connected wires
            for (const node of value.nodes) {
                if (value[node].wireId !== undefined) {
                    wires[value[node].wireId].highlight = true

                } 
            }
        }

        // get nodes within selected rectangle
        for (let [key, wire] of Object.entries(wires)) {
            for (const node of wire.nodes) {
                node.highlight = false;
                if (!((x1 - node.x) * (mouse.canvas.x - node.x) <= 0)) continue
                if (!((y1 - node.y) * (mouse.canvas.y - node.y) <= 0)) continue
                node.highlight = true;
            }
        }

        selectedComponents()
        return
    }
};

canvas.onmousewheel = function(e) {
    e.preventDefault();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;

    smoothZoom = Math.min( Math.max(smoothZoom - (z/8) * ((e.deltaY) > 0 ? .3 : -.5),           // TODO: MAKE READABLE
        //minimum ), maximum zoom      
            15), 300
    );

    //level of current zoom shown on screen
    zoomPercentage.innerHTML = Math.round(z) + '%';                 
    return false;
}

canvas.onmousedown = function(e) {
    e.preventDefault();

    origin.click.x = e.x;
    origin.click.y = e.y;
    origin.prev.x = origin.x;
    origin.prev.y = origin.y;

    getObject(mouse.canvas.x,mouse.canvas.y)

    // detect right click
    if (e.button === 2) {
        //rightClick = true;

        if (select.components.length > 1) {
            return
        }

        if (clickedProxy.isComponent) {
            clearHighlight( 'objects' )
            clickedProxy.object.highlight = true;
            
            if (clickedProxy.object.constructor === Clock) {
                setClock.style.display = "flex";
                return
            }
            setClock.style.display = "none";
            return
        }

        if (clickedProxy.isWire) {
            clickedProxy.wire.highlight = true
        }
        return
    }

    // selection tool
    if (select.action) {
        drawingRect.push({x: origin.click.x, y: origin.click.y, w: 0, h: 0})
        return
    }

    if (clickedProxy.isComponent) {
        mouse.moveOffset.components = []
        mouse.moveOffset.nodes = []
        for (const part of select.components) {
            mouse.moveOffset.components.push({id: parseInt(part.id), x: part.x, y: part.y})
        }
        for (const node of select.nodes) {
            let wire = wires[node.wireId]
            mouse.moveOffset.nodes.push({wireId: node.wireId, index: node.index,
                 x: wire.nodes[node.index].x, 
                 y: wire.nodes[node.index].y})
        }
        clickedProxy.object.highlight = true;
        dragging = true;
    }

    if (clickedProxy.isNode) do {
        clearHighlight( 'objects' )
        clearHighlight( 'wires' )
        rotateButtons('hide')
        if (clickedProxy.node.highlight) {
            clickedProxy.node.highlight = true;
            dragging = true;
            break
        }
        clearHighlight( 'nodes' )
        drawing = true;

        //create temporary line with one ends location set to clickedProxy node
        drawingLine.push(new TempLine(clickedProxy.node));

        // set seconds ends location to cursor
        drawingLine[0].x2 = (e.x / z - 0.5) + origin.x;
        drawingLine[0].y2 = (-e.y / z + 0.5) + origin.y;
    } while (false)

    if (clickedProxy.isWire) {
        let node = make.node(Math.round(mouse.canvas.x*2)/2, Math.round(mouse.canvas.y*2)/2 ,clickedProxy.wire.id, 'output')

        //place new node between correct nodes
        let newNodesArray = []
        if (clickedProxy.wire.nodes.length < 1) {
            newNodesArray.push(node);
            clickedProxy.wire.nodes = newNodesArray;
            return
        }
    
        let wire = clickedProxy.wire
        // all nodes on wire
        let orderedPoints = [wire.node.a, ...wire.nodes, wire.node.b]
        
        while (orderedPoints.length > 1) {
            // remove first set of node coordinates and assign to variable

            const current = orderedPoints.shift();
            newNodesArray.push(current)

            if (((current.x - node.x) * (orderedPoints[0].x - node.x) <= 0) &&
                ((current.y - node.y) * (orderedPoints[0].y - node.y) <= 0)) {
                    newNodesArray.push(node)
                }
        }

        //remove first node
        newNodesArray.shift()
        clearHighlight( 'nodes' )
        clickedProxy.wire.nodes = newNodesArray
    }

    //detect label
    for (let [id, object] of Object.entries(objects)) {
        if (object.constructor === CustomComponent) {
        if (!object.highlight && !settings.showLabels) continue
            for (let [name, node] of Object.entries(object.offset)) {
                
                let invert = 1
                if  (node.x < 0 && (object.r === 0 || object.r === 180)) invert = -1;
                if  (node.y < 0 && (object.r === 90 || object.r === 270)) invert = -1;

                const textWidth = ctx.measureText(name).width
                let height = z/6
                let width = invert * (textWidth*1.2 + z/15)
                if  (object.r === 90 || object.r === 270) {
                    height = invert * (textWidth*1.2 + z/15)
                    width = z/6
                }

                let offset = { x: -.085, y: - height/2/z}
                if (node.x < 0 && (object.r === 0 || object.r === 180)) offset.x *= -1;
                if (object.r === 90 || object.r === 270) {
                    offset = { x: width/2/z, y: -(height/z) - invert * .085}
                }

                let x = (-origin.x + .5 + object.x + node.x - offset.x) * z
                let y = (origin.y + .5 - object.y - node.y + offset.y) * z

                if (width < 0) x+=width
                if (height < 0) y+=height

                let a = within.rectangle(x,y, Math.abs(width), Math.abs(height), e.x, e.y)
                if (!a) continue
                clicked.isLabel = true
                clickedProxy.object = {id: id, name: name}

                //get all offsets on side of custom component
                offsetRange = {}
                if (objects[id].offset[name].x < 0 && (object.r === 0 || object.r === 180)) {
                    for (const [key,node] of Object.entries(objects[id].offset)) {
                        if (node.x < 0) offsetRange[key] = {x: node.x, y: node.y}
                    }
                }

                if (objects[id].offset[name].x > 0 && (object.r === 0 || object.r === 180)) {
                    for (const [key,node] of Object.entries(objects[id].offset)) {
                        if (node.x > 0) offsetRange[key] = {x: node.x, y: node.y}
                    }
                }

                if (objects[id].offset[name].y < 0 && (object.r === 90 || object.r === 270)) {
                    for (const [key,node] of Object.entries(objects[id].offset)) {
                        if (node.y < 0) offsetRange[key] = {x: node.x, y: node.y}
                    }
                }

                if (objects[id].offset[name].y > 0 && (object.r === 90 || object.r === 270)) {
                    for (const [key,node] of Object.entries(objects[id].offset)) {
                        if (node.y > 0) offsetRange[key] = {x: node.x, y: node.y}
                    }
                }
            }
        }
    }

    if (!clickedProxy.isNode && !clickedProxy.isComponent && !clicked.isLabel) {
        nameFormContainer.style.display = "none";
        document.getElementById("fname").value = ''
        clearHighlight( 'all' )
        rotateButtons('hide')
    }

    rightClickMenu.style.visibility = "hidden";
    rightClickSecondary.style.visibility = "hidden";
    mouseDown = true;
    //start timer for mouse click duration
    timer.start = new Date().getTime() / 1000                        
    pointerEventsNone('add');
    canvas.style.cursor = "grabbing";
}

canvas.onmouseup = function(e) {
    e.preventDefault();

    let previousNode = clickedProxy.node;
    getObject(mouse.canvas.x, mouse.canvas.y);

    mouseDown = false
    //end timer for mouse click duration
    timer.end = new Date().getTime() / 1000;

    if (select.action) {
        selectButton.classList.remove("action-menu-item-highlight");
        drawingRect = [];
        select.action = false;
        return
    }

    if (clicked.isLabel) {
        const id = clicked.object.id
        const name = clicked.object.name
        if (objects[id].r === 0 || objects[id].r === 180) {
            objects[id].offset[name].y = offsetRange[name].y
        }
        if (objects[id].r === 90 || objects[id].r === 270) {
            objects[id].offset[name].x = offsetRange[name].x
        }
        clicked.isLabel = false
    }

    if (clickedProxy.isComponent) {
        if (mouseClickDuration(timer.start, timer.end, .2)) {
            clickedProxy.object.changeState;
            clearHighlight( 'objects' )
            clearHighlight( 'wires' )
        } 
        clickedProxy.object.highlight = true;
    }

    if (clickedProxy.isNode) do {
        if (mouseClickDuration(timer.start, timer.end, .2)) {
            if (clickedProxy.node.connectionType === wires) {
                clickedProxy.node.highlight = true;
            }
            break;
        } 
        connectNodes(previousNode)
    } while (false);

    if (drawing) drawingLine = [];

    //rightClick = false;
    dragging = false;
    drawing = false;
    resetSettingsMenu()
    if (mouseClickDuration(timer.start, timer.end, .2) && select.components.length > 0) {
        rotateButtons('unhide')
    }
    pointerEventsNone('remove');
    canvas.style.cursor = "crosshair";
}

function connectNodes(pNode) {
    if (pNode.connected || clickedProxy.node.connected || !clickedProxy.isNode) {
        return;
    }

    if ( pNode.id === clickedProxy.node.id) {
        return
    }

    // if inputs are both inputs or both outputs reject
    if ( stringIncludes('output', pNode.name) && stringIncludes('output', clickedProxy.node.name) ) {
        return
    }

    if ( stringIncludes('input', pNode.name) && stringIncludes('input', clickedProxy.node.name) ) {
        return
    }

    let wire = new Wire( { a: pNode, b: clickedProxy.node } );
    wire.id = generateId();
    wires[wire.id] = wire

    pNode.connected = true;
    clickedProxy.node.connected = true;
    // set id for wire connected to node
    pNode.wireId = wire.id;
    clickedProxy.node.wireId = wire.id;
    wires[wire.id].state
}

function clearHighlight( type ) {

    if (type === 'wires' || type === 'all') {
        for (let [key, value] of Object.entries(wires)) {
            value.highlight = false
        }
        if (type === 'wires') return
    }

    if (type === 'objects' || type === 'all') {
        for (let [key, value] of Object.entries(objects)) {
            value.highlight = false
        }
    }

    if (type === 'nodes' || type === 'all') {
        for (let [key, wire] of Object.entries(wires)) {
            for (const node of wire.nodes) {
                node.highlight = false;
            }
        }
    }
}

//returns component and node 
function getObject(x, y) {
    if (clicked.isLabel) return
    resetStates()
    //detect node under cursor
    for (const ele in objects) {
        for (const e of objects[ele].nodes) {
            let a = objects[ele][e].x
            let b = objects[ele][e].y
            //.09 is detection radius from center of node
            if (within.circle(a, b, 0.1, x, y)) {
                clickedProxy.isNode = true;
                clickedProxy.object = objects[ele];
                clickedProxy.node = objects[ele][e];
                return; 
            }
        }
    }
    for (let [key, wire] of Object.entries(wires)) {
        for (const node of wire.nodes) {
            let a = node.x
            let b = node.y
            //.09 is detection radius from center of node
            if (within.circle(a, b, 0.1, x, y)) {
                clickedProxy.isNode = true;
                clickedProxy.object = node;
                clickedProxy.node = node;
                return; 
            }
        }
    }
    //detect component under cursor
    for (let [key, obj] of Object.entries(objects)) {
        if (within.rectangle(obj.x - (obj.hitbox.w/2), obj.y - (obj.hitbox.h/2), obj.hitbox.w, obj.hitbox.h, x, y)) {
            clickedProxy.isComponent = true;
            clickedProxy.object = obj;
            return;
        }
    }

    //detect wire under cursor
    for (let [key, wire] of Object.entries(wires)) {
        for (const segment of getWireSegments(wire)) {
            if (pointOnLine (segment[0],segment[1], x, y, .09)) {
                clickedProxy.isWire = true;
                clickedProxy.wire = wire;
                return
            }

        }
    }

    function resetStates() {
        clickedProxy.isComponent = false;
        clickedProxy.isNode = false;
        clickedProxy.isWire = false;
        //clickedProxy.isLabel = false;
        clickedProxy.object = undefined;
        clickedProxy.node = undefined;
        clickedProxy.wire = undefined;
    }
    return false
}


let offsetRange = {}
function moveLabels(id,name) {
    for (const [key, {x,y}] of Object.entries(offsetRange)) {
        if (key === name) continue
        let difference = y + -1 * objects[id].offset[name].y
        if (objects[id].r === 90 || objects[id].r === 270) {
            difference = x + -1 * objects[id].offset[name].x
        }
        if (difference < .1 && difference > -.1) {

            if (objects[id].r === 0 || objects[id].r === 180) {
                //swap values
                [offsetRange[key].y,offsetRange[name].y] = [offsetRange[name].y,offsetRange[key].y]
                //update node offset
                animate(objects[id].offset[key], offsetRange[key].y, 'y')
                //objects[id].offset[key].y = offsetRange[key].y
            }
            if (objects[id].r === 90 || objects[id].r === 270) {
                [offsetRange[key].x,offsetRange[name].x] = [offsetRange[name].x,offsetRange[key].x]
                animate(objects[id].offset[key], offsetRange[key].x, 'x')
                //objects[id].offset[key].x = offsetRange[key].x
            }
        }
    }
}

// action menu buttons
const undobutton = document.getElementById("undo");
addMdi(mdiUndoVariant,undobutton, color.icon, 24, 24, 'post-icon')
undobutton.onclick = function() {
    if (wires.length === 0) return;

    let wireId = wires[(wires.length - 1)].id

    for (const ele in objects) {
        for (const e of objects[ele].nodes) {
            if (objects[ele][e].connection === wireId) {
                objects[ele][e].connection = undefined
            }
        }
    }
    wires.pop()
}

const zoomPercentage = document.getElementById("zoomlevel");
zoomPercentage.innerHTML = Math.round(z) + '%';
// reset canvas to origin
zoomPercentage.onclick = function() {
    z = 100;
    smoothZoom = z;
    origin.x = canvasCenter.x;
    origin.y = canvasCenter.y;
    zoomPercentage.innerHTML = Math.round(z) + '%';
};

const zoomInButton = document.getElementById("zoom-in");
addMdi(mdiPlus,zoomInButton, color.icon, 24, 24, 'post-icon')
zoomInButton.onmousedown = function() {
    zoomInButton.classList.add("action-menu-item-highlight");
    mouse.screen.x = canvas.width / 2;
    mouse.screen.y = canvas.height /2;
    smoothZoom = Math.min(500, Math.round(smoothZoom + settings.zoomButtons));
    zoomPercentage.innerHTML = Math.round(smoothZoom) + '%';
};

const zoomOutButton = document.getElementById("zoom-out");
addMdi(mdiMinus,zoomOutButton, color.icon, 24, 24, 'post-icon')
zoomOutButton.onclick = function() {
    mouse.screen.x = canvas.width / 2;
    mouse.screen.y = canvas.height /2;
    smoothZoom = Math.max(10, Math.round(smoothZoom - settings.zoomButtons));
    zoomPercentage.innerHTML = smoothZoom + '%';
};

const selectButton = document.getElementById("select");
addMdi(mdiSelection,selectButton, color.icon, 24, 24, 'post-icon')
selectButton.onclick = function() {
    if (select.action) {
        select.action = false;
        selectButton.classList.remove("action-menu-item-highlight")
    } else {
        select.action = true;
        selectButton.classList.add("action-menu-item-highlight")
    }
}

const saveButton = document.getElementById("save");
addMdi(mdiContentSave,saveButton, color.icon, 24, 24, 'post-icon')
saveButton.onclick = function() {
    window.localStorage.clear();

    for (let [key, object] of Object.entries(objects)) {

        if (object.constructor === CustomComponent) {
            storeCustomComponent(object)
            continue
        }

        if (object.constructor === Clock) {
            console.log('reject clock')
            continue
        }

        if (object.constructor === ConstantHigh) {
            console.log('reject constant')
            continue
        }

        storeObject(object, false)
    }

    for (let [key, wire] of Object.entries(wires)) {
        storeWire(wire, false)
    }

    // if no objects set generator to 1
    if (Object.keys(objects).length === 0) {
        window.localStorage.setItem('gen', 1)
        return
    }

    // get largest id
    const keysObjects = Object.keys(objects);
    const keysWires = Object.keys(wires);
    const maxId = Math.max(...keysObjects, ...keysWires)
    // store value for id generator
    window.localStorage.setItem('gen', maxId + 1)

    // store settings
    window.localStorage.setItem('darkMode', settings.darkMode)
    window.localStorage.setItem('showLabels', settings.showLabels)

    function storeWire(wire) {
        window.localStorage.setItem(wire.id, JSON.stringify(
            { 
                'type': 'wire',
                'a': {id: wire.node.a.id, name: wire.node.a.name},
                'b': {id: wire.node.b.id, name: wire.node.b.name},
                'nodes': wire.nodes
            }, replacerConnectionType
        ));
    }

    function storeObject(object) {
        window.localStorage.setItem(object.id, JSON.stringify(
            { 
                'type': 'object',
                'component': object,
            }, replacerImg
        ));
    }

    function storeCustomComponent(component) {

        window.localStorage.setItem(component.id, JSON.stringify(
            { 
                'type': 'customcomponent',
                'component': component,
                'list': Object.keys(component.objects)
            }, replacer
        ));

        for (const [id, object] of Object.entries(component.objects)) {
            if (object.constructor === CustomComponent) {
                storeCustomComponent(object)
                continue
            }
            storeObject(object)
        }

        for (const [id, wire] of Object.entries(component.wires)) {
            storeWire(wire)
        }
    }

    function replacerImg(key, value) {
        // Filtering out properties
        if (key === 'image' || key === 'img') {
            return;
        }
        return value;
    }
    
    function replacer(key, value) {
        // Filtering out properties
        if (key === 'objects' || key === 'connectionType') {
            return;
        }
        return value;
    }

    function replacerConnectionType(key, value) {
        // Filtering out properties
        if (key === 'connectionType') {
            for (const [key, wire] of Object.entries(value)) {
                if (wire.constructor === Wire) return 'wires'
            }
            return;
        }
        return value;
    }

    const limit = 1024 * 1024 * 5; // 5 MB
    const used = decodeURI(encodeURIComponent(JSON.stringify(localStorage))).length
    const remSpace = limit - used;
    console.log(`${formatBytes(used)} used of Local Storage. ${formatBytes(remSpace)} remaining`);

    if (remSpace <= 0) {
        alert('Local Storage is full')
    }
}



const rotateButtons = (x) => {
    if (x === 'unhide') {
        rotateLeft.classList.remove("hide");
        rotateRight.classList.remove("hide");
    }
    if (x === 'hide') {
        rotateLeft.classList.add("hide");
        rotateRight.classList.add("hide");
    }
}

function locateRotateButtons(object) {

    // get width and height offset
    let h = Math.max(0, object.hitbox.h - 1)
    let w = Math.max(0, object.hitbox.w - 1)


    //get grid location for buttons
    const y = ( (origin.y - object.y - h) * z )
    const xL = ( (-origin.x + object.x - w) * z )
    const xR = ( (-origin.x + object.x + w) * z )

    rotateLeft.style.left = `${(xL + z/2 - 15) - z/2}px`;
    rotateLeft.style.top = `${y - 20}px`;

    rotateRight.style.left = `${(xR + z/2 - 16) + z/2}px`;
    rotateRight.style.top = `${y - 17}px`;
}

rotateRight.onclick = function() {
    const angle = [270, 180, 90, 0];
    const next = (current) => angle[(angle.indexOf(current) + 1) % 4];
    let id = clickedProxy.object.id
    objects[id].r = next(objects[id].r);
    objects[id].rotateNodes('left');
}

rotateLeft.onclick = function() {
    const angle = [0, 90, 180, 270];
    const next = (current) => angle[(angle.indexOf(current) + 1) % 4];
    let id = clickedProxy.object.id
    objects[id].r = next(objects[id].r);
    objects[id].rotateNodes('right');
}

deleteButton.onclick = function() {
    if (clickedProxy.wire) {
        deleteWire(clickedProxy.wire.id, true)
        return
    }

    if (clickedProxy.isNode) {
        if (clickedProxy.node.wireId) {
            deleteWire(clickedProxy.node.wireId, true)
        }
        for (let index in wires[clickedProxy.node.id].nodes) {
            let x = wires[clickedProxy.node.id].nodes[index].x
            let y = wires[clickedProxy.node.id].nodes[index].y

            if (x === clickedProxy.node.x && y === clickedProxy.node.y) {
                wires[clickedProxy.node.id].nodes.splice(index, 1)
           }
        }
        return
    }

    let parts = select.components
    if (parts.length > 1) {
        for (let part of parts) {
            deleteComponent(part.id, true)
        }
        // reset id iterator
        //if (Object.keys(objects).length === 0 && Object.keys(wires).length === 0) iterate = 0
        return
    }

    deleteComponent(clickedProxy.object.id, true)
    rotateButtons('hide')
}

//delete key
//FIXME: disable when typing in form
// document.addEventListener('keydown', (event) => {
//     const keyName = event.key;

//     rightClickMenu.style.visibility = "hidden";
//     rightClickSecondary.style.visibility = "hidden";

//     if (clickedProxy.wire) {
//         deleteWire(clickedProxy.wire.id, true)
//         return
//     }

//     if (keyName === "Backspace") {

//         let parts = select.components
//         if (parts.length > 1) {
//             for (let part of parts) {
//                 deleteComponent(part.id, true)
//             }
//             // reset id iterator
//             if (Object.keys(objects).length === 0 && Object.keys(wires).length === 0) iterate = 1
//             return
//         }
//         deleteComponent(clickedProxy.object.id, true)
//         rotateButtons('hide')
//     }
// })

// auto generate "settings-menu-container"
const settings1 = document.getElementById("settings-1");
const settings2 = document.getElementById("settings-2");
const settings3 = document.getElementById("settings-3");
const settings4 = document.getElementById("settings-4");
const settingsMenuArrow = document.getElementById("settings-menu-arrow");

const settingsMenuObserver = new ResizeObserver(entries => {
    // this will get called whenever div dimension changes
     entries.forEach(entry => {
       if (entry.contentRect.height > 5) settings1.style.visibility = "visible";
       if (entry.contentRect.height > 5) settings1.style.opacity = "1";
       if (entry.contentRect.height > 25) settings2.style.visibility = "visible";
       if (entry.contentRect.height > 25) settings2.style.opacity = "1";
       if (entry.contentRect.height > 45) settings3.style.visibility = "visible";
       if (entry.contentRect.height > 45) settings3.style.opacity = "1";
       if (entry.contentRect.height > 65) settings4.style.visibility = "visible";
       if (entry.contentRect.height > 65) settings4.style.opacity = "1";
     });
   });

let disableToolTip
settingsButton.onclick = function() {
    disableToolTip = true
    tooltip.style.display = "none";
    settingsButton.classList.add("action-menu-item-highlight-edge");

    let top = getOffset(settingsButton).top;
    settingsMenuObserver.observe(settingsMenu);
    settingsMenu.style.visibility = "visible";
    settingsMenuArrow.style.visibility = "visible";

    settingsMenu.style.width = '200px'
    settingsMenu.style.height = '75px'

    settingsMenu.style.top = (top+44)+"px";

    setTimeout(() => {
        settings.open = true
        settingsMenuObserver.disconnect()
      }, "500")
}

darkModeBox.addEventListener('change', function() {
  if (this.checked) {
    settings.darkMode = true;
    color.update()
  } else {
    settings.darkMode = false;
    color.update()
  }
});

showLabelsBox.addEventListener('change', function() {
    if (this.checked) {
      settings.showLabels = true;
    } else {
      settings.showLabels = false;
    }
  });

const smoothZoomBox = document.getElementById("menu-smooth-zoom");
smoothZoomBox.addEventListener('change', function() {
  if (this.checked) {
    settings.smoothZoom = true;
  } else {
    settings.smoothZoom = false;
  }
});

function resetSettingsMenu() {
    if (!settings.open) return

    settingsMenu.style.visibility = "hidden";
    settingsMenuArrow.style.visibility = "hidden";
    settings1.style.visibility = "hidden";
    settings2.style.visibility = "hidden";
    settings3.style.visibility = "hidden";
    settings4.style.visibility = "hidden";

    settingsMenu.style.width = '41px'
    settingsMenu.style.height = '0px'

    settings1.style.opacity = "0";
    settings2.style.opacity = "0";
    settings3.style.opacity = "0";
    settings4.style.opacity = "0";
    disableToolTip = false
    settings.open = false
}


// FIXME:
//boolean to reset id's from 1
function convertSelectiontoJson(reset) {
    let custom = {}
    selectedComponents()
    let parts = select.components
    let partIdArray = []

    for (const part of parts) {
        partIdArray.push(parseInt(part.id))
    }

    for (const part of parts) {
        if (part.constructor === CustomComponent) {
            storeCustomComponent(part)
            continue
        }
        storeObject(part)
    }

    for (let [id, wire] of Object.entries(wires)) {
        if (wire.highlight) {
            //ignore partially connected wires 
            if (!partIdArray.includes(parseInt(wire.node.a.id))) continue
            if (!partIdArray.includes(parseInt(wire.node.b.id))) continue

            storeWire(wire)
        }
    }

    //FIXME:
    //does not work in safari
    const regexId = /(?<="id":|"id":"|"wireId":|"wireId":")\d+/gm
    const regexList = /(?<=list.*)\d+(?<!\]}.*)/gm
    const wireKey = /(?<=wires":{"|},")\d+(?=":{"nodeState")/mg

    // const regex1 = `("id":|"id":"|"wireId":"|"wireId":)(\\d+)`
    // const regexId = new RegExp(regex1,"gm");

    // const regex2 = `(list.*)\\d+(.*)(?=\]})`
    // const regexList = new RegExp(regex2,"gm");

    // const regex3 = `(},"|},)\\d+(":{"nodeState"|:{"nodeState")`
    // const wireKey = new RegExp(regex3,"gm");

    // decrement all id's 
    if (reset) {
        let idArray = []
        for (let [key, json] of Object.entries(custom)) {
            let a = json.match(regexId);
            let b = json.match(regexList)
            let c = json.match(wireKey)
    
            if (a === null) a = []
            if (b === null) b = []
            if (c === null) c = []
    
            
            idArray = [...idArray, ...a]
            idArray = [...idArray, ...b]
            idArray = [...idArray, ...c]
        }

        let removeDuplicates = [...new Set(idArray)].sort(function(a, b){return a - b});
        let stack = removeDuplicates.map(x => parseInt(x))

        if (stack.includes(0)) {
            throw 'Cannot copy, sub-component has id of "0"';
          }

        let i = 1 
        while (stack.length > 0) {
            const id = stack.shift()

            const regex1 = `("id":|"id":"|"wireId":"|"wireId":)${id}(,|")`
            const regexId = new RegExp(regex1,"gm");
    
            const regex2 = `(list.*")${id}(".*)(?=\]})`
            const regexList = new RegExp(regex2,"gm");
    
            const regex3 = `(},"|},)${id}(":{"nodeState"|:{"nodeState")`
            const wireKey = new RegExp(regex3,"gm");
    
            for (let [key, json] of Object.entries(custom)) {
                custom[key] = json.replace(regexId, `$1${i}$2`)
                custom[key] = custom[key].replace(regexList, `$1${i}$2`)
                custom[key] = custom[key].replace(wireKey, `$1${i}$2`)
            }
        
            i++
        }
    
        i = 1
        for (let [key, json] of Object.entries(custom)) {
            if (parseInt(key) !== i) {
                Object.defineProperty(custom, i,
                    Object.getOwnPropertyDescriptor(custom, key));
                delete custom[key];
            }
            i++
        }
    }

    function storeCustomComponent(component) {

        for (const [id, object] of Object.entries(component.objects)) {
            if (object.constructor === CustomComponent) {
                storeCustomComponent(object)
                continue
            }
            storeObject(object)
        }

        for (const [id, wire] of Object.entries(component.wires)) {
            storeWire(wire)
        }

        // get wire id's
        let wires = []
        for (const [id, wire] of Object.entries(component.wires)) {
            wires.push(id)
        }

        custom[component.id] = JSON.stringify(
            { 
                'type': 'customcomponent',
                'component': component,
                'list': Object.keys(component.objects),
                'wires': wires
            }, replacer
        );
    }

    function storeWire(wire) {
        custom[wire.id] = JSON.stringify(
            { 
                'type': 'wire',
                'a': {id: wire.node.a.id, name: wire.node.a.name},
                'b': {id: wire.node.b.id, name: wire.node.b.name},
                'nodes': wire.nodes
            }, replacerConnectionType
        );
    }

    function storeObject(object) {
        custom[object.id] = JSON.stringify(
            { 
                'type': 'object',
                'component': object,
            }, replacerImg
        );
    }
    
    function replacer(key, value) {
        // Filtering out properties
        if (key === 'objects' || key === 'connectionType') {
            return;
        }
        if (key === 'connected') {
            return false
        }
        if (key === 'wires' && !Array.isArray(value)) {
            return
        }
        return value;
    }

    function replacerImg(key, value) {
        // Filtering out properties
        if (key === 'image' || key === 'img') {
            return;
        }
        return value;
    }

    function replacerConnectionType(key, value) {
        // Filtering out properties
        if (key === 'connectionType') {
            for (const [key, wire] of Object.entries(value)) {
                if (wire.constructor === Wire) return 'wires'
            }
            return;
        }
        return value;
    }
    return custom
}

saveComponentButton.onclick = function() {
    let object = clickedProxy.object
    if (select.components.length > 1) {
        alert("can only save 1 component")
        return
    }

    if (object.constructor !== CustomComponent) {
        alert("object is not a Custom Component")
        return
    }

    let obj = convertSelectiontoJson(true)
}

const cutButton = document.getElementById("cut");
cutButton.onclick = function() {
    copy = convertSelectiontoJson(false)

    let parts = select.components
    for (let part of parts) {
        deleteComponent(part.id, true)
    }
}

const copyButton = document.getElementById("copy");
copyButton.onclick = function() {
    try {
        copy = convertSelectiontoJson(true)
      } catch (e) {
        console.error(e);
      }
}

const pasteButton = document.getElementById("paste");
pasteButton.onclick = function() {
    clearHighlight( 'all' )
    buildComponent(copy)
}


function loadSave() {
    if (window.localStorage.length < 1) return

    // parse json
    let parsed = {}
    for (const [id, string] of Object.entries(localStorage)) {
        parsed[id] = JSON.parse(string)
    }

    for (const [id, object] of Object.entries(parsed)) {
        // adguard adds object to localstorage; ignore
        if(stringIncludes('_',id)) continue

        //set iterator to saved iteration
        if (id === 'gen') {
            iterate = object
            delete parsed[id]
        }

        if (id === 'darkMode') {
            settings.darkMode = object
            darkModeBox.checked = object
        }

        if (id === 'showLabels') {
            settings.showLabels = object
            showLabelsBox.checked = object
        }
    }

    // build component from save
    for (const [id, object] of Object.entries(parsed)) {
        if(stringIncludes('_',id)) continue


        if (object.type === 'wire') {
            let node = {}
            const nodeId = {
                a: object.a.id.toString(),
                b: object.b.id.toString()
            } 

            // check if node is on an object or wire
            if (Object.keys(objects).includes(nodeId.a)) {
                node.a = objects[nodeId.a][object.a.name]
            }

            if (Object.keys(objects).includes(nodeId.b)) {
                node.b = objects[nodeId.b][object.b.name]
            }

            if (Object.keys(wires).includes(nodeId.a)) {
                let wireNode;
                for (const node of wires[object.a.id].nodes) {
                    if (parseInt(id) === parseInt(node.wireId)) {
                        wireNode = node;
                        break;
                    }
                }
                node.a = wireNode
            }

            if (Object.keys(wires).includes(nodeId.b)) {
                let wireNode;
                for (const node of wires[object.b.id].nodes) {
                    if (parseInt(id) === parseInt(node.wireId)) {
                        wireNode = node;
                        break;
                    }
                }
                node.b = wireNode
            }

            let wire = new Wire( { a: node.a, b: node.b } );

            wires[id] = wire
            wires[id].id = id
        
            node.a.connected = true;
            node.b.connected = true;
            // set id for wire connected to node
            node.a.wireId = id;
            node.b.wireId = id;
            wires[id].state

            // add nodes on wire (between ends a and b)
            let nodes = []
            for (const node of object.nodes) {
                let newNode = make.node( 0, 0, id, 'output' )
                Object.assign(newNode, node)
                //fix properties that may not assign properly
                newNode.connectionType = wires
                newNode.id = parseInt(newNode.id)
                nodes.push(newNode)
            }
            wires[id].nodes = nodes
        }

        if (object.type === 'object') {
            let type = object.component.classname.toLowerCase()
            type = type.replace('gate', '');
            make[type](0,0,0,id)
            Object.assign(objects[id], object.component)
        }

        if (object.type === 'customcomponent') {
            let list = []
            for (const id of object.list) {
                list.push(objects[id])
            }

            objects[id] = makeCustomComponent(list, id)

            objects[id].x = object.component.x
            objects[id].y = object.component.y
            objects[id].r = object.component.r
            objects[id].name = object.component.name
            objects[id].offset = object.component.offset
            objects[id].hitbox = object.component.hitbox
        }
    }


    // propogate states by flipping switches
    for (const [id, object] of Object.entries(objects)) {
        if (object.constructor === OnOffSwitch) {
            object.changeState
            object.changeState
        }
    }
    
    return

    // propogate state of all wires
}

customComponentButton.onclick = function() {
    let parts = select.components
    const id = generateId()
    let cc = makeCustomComponent(parts, id)
    
    if (cc === undefined) return
    
    objects[id] = cc
}

// TODO: remove
function toggleRightClickMenu() {
    rightClickMenu.style.visibility = 'hidden';
    rightClickSecondary.style.visibility = "hidden";
}

const pointerEventsNone = (x) => {
    let elements = [
        zoomInButton,
        zoomOutButton,
        zoomPercentage
    ]
    for (const ele of elements) {
        if (x === 'add') ele.classList.add("unselectable");
        if (x === 'remove') ele.classList.remove("unselectable");
    }
}

function drawRotated(image, x, y, w, h, degrees) {
    ctx.save();
    ctx.translate(x+(image.width/200)*z, y+(image.width/200)*z);
    ctx.rotate(degrees * -Math.PI / 180);
    ctx.translate((-image.width/200)*z, ((-image.height/200)*z));
    ctx.drawImage(image, 0, 0, w, h);
    ctx.restore();
}

//draw line function
export function drawLine (x1, y1, x2, y2, width) {
    ctx.lineWidth = z/width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawNodes() {
    // get nodes on objects
    for (const ele in objects) {
        for (const e of objects[ele].nodes) {
            let a = objects[ele][e].x
            let b = objects[ele][e].y
            ctx.lineWidth = z/30;
            drawShape.circle(a , b, 5.5, 'black', true, 'white', true, ctx)
            if (objects[ele][e].connected === true) {
                let color = 'black'
                if (objects[ele][e].state === 1) color = '#27CF00'
                drawShape.circle(a , b, 3, 'black', false, color, true, ctx)
            }
            
        }
    }

    //get nodes on wires
    for (let [key, wire] of Object.entries(wires)) {
        for (const node of wire.nodes) {
            let a = node.x
            let b = node.y
            ctx.lineWidth = z/30;
            drawShape.circle(a , b, 5.5, 'black', true, 'white', true, ctx)

            if (node.connected === true) {
                let color = 'black'
                if (node.state === 1) color = '#27CF00'
                drawShape.circle(a , b, 3, 'black', false, color, true, ctx)
            }
            }
        }
}

function drawNodeHighlight() {
    //get nodes on wires
    for (let [key, wire] of Object.entries(wires)) {
        for (const node of wire.nodes) {
            if (node.highlight) {
                let a = node.x
                let b = node.y
                ctx.lineWidth = z/10;
                drawShape.circle(a , b, 8.5, '#00B6FF', true, 'white', false, ctx)
            }
        }
    }
}

function drawWire(wire) {
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo((-origin.x + wire.loc.a.x + 0.5)* z, (origin.y - wire.loc.a.y + 0.5) * z, z, z);
    for (const node of wire.nodes) {
        ctx.lineTo((-origin.x + node.x + 0.5)* z, (origin.y - node.y + 0.5) * z, z, z);
    }
    ctx.lineTo((-origin.x + wire.loc.b.x + 0.5)* z, (origin.y - wire.loc.b.y + 0.5) * z, z, z);
    ctx.stroke();
}

function drawTempWire(wire) {
    ctx.lineWidth = z/20;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo((-origin.x + wire.x1 + 0.5)* z, (origin.y - wire.y1 + 0.5) * z, z, z);
    ctx.lineTo((-origin.x + wire.x2 + 0.5)* z, (origin.y - wire.y2 + 0.5) * z, z, z);
    ctx.stroke();
}

function drawRotatedImg(value) {
    ctx.save();

    let a = z/2 + value.x*z
    let b = z/2 + -value.y*z
    let xOrigin;
    let yOrigin;

    // TODO: REFACTOR
    if (value.r === 0) {
        xOrigin = origin.x;
        yOrigin = origin.y;
    }
    if (value.r === 90) {
        xOrigin = origin.y;
        yOrigin = -origin.x;
    }
    if (value.r === 180) {
        xOrigin = -origin.x;
        yOrigin = -origin.y;
    }
    if (value.r === 270) {
        xOrigin = -origin.y;
        yOrigin = origin.x;
    }

    ctx.translate(a, b)
    ctx.rotate(value.r * -Math.PI / 180);
    ctx.translate(-a, -b)

    value.shape(value.x, -value.y, xOrigin, yOrigin, z, value.w, value.h, ctx, value)

    ctx.restore();
}

function getWireSegments(wire) {
    let queue = []
    // add coordinates of node 'a' to queue
    queue.push([wire.node.a.x, wire.node.a.y])
    // add coordinates of each node in node array
    for (const node of wire.nodes) {
        queue.push([node.x,node.y])
    }
    // add coordinates of node 'b' to queue
    queue.push([wire.node.b.x, wire.node.b.y])

    let segments = []
	while (queue.length > 1) {
        // remove first set of node coordinates and assign to variable
        const current = queue.shift();
        // push first set and second set of coordinates to segments array
        segments.push([current,queue[0]]);
	}
    return segments
}

function detectWireIntersection() {
    let points = []

    for (let [key, wire1] of Object.entries(wires)) {
        let segments = getWireSegments(wire1)
        for (const co of segments) {
            const p1 = { x: co[0][0], y: co[0][1] }
            const q1 = { x: co[1][0], y: co[1][1] }
            
            for (let [key, wire2] of Object.entries(wires)) {
                let segments = getWireSegments(wire2)
                for (const co of segments) {
                    const p2 = { x: co[0][0], y: co[0][1] }
                    const q2 = { x: co[1][0], y: co[1][1] }
                    if (p1 === p2 && q1 === q2) continue

                    let px = ((p1.x * q1.y - p1.y * q1.x)*(p2.x-q2.x) - (p2.x * q2.y - p2.y * q2.x)*(p1.x-q1.x)) / ((p1.x-q1.x) * (p2.y-q2.y) -(p1.y-q1.y) * (p2.x-q2.x));
                    let py = ((p1.x * q1.y - p1.y * q1.x)*(p2.y-q2.y) - (p2.x * q2.y - p2.y * q2.x)*(p1.y-q1.y)) / ((p1.x-q1.x) * (p2.y-q2.y) -(p1.y-q1.y) * (p2.x-q2.x));

                    if ( isNaN(px) || isNaN(py) ) continue

                    if (!pointOnLine (p1,q1,px,py, .1)) continue
                    if (!pointOnLine (p2,q2,px,py, .1)) continue

                    points.push( {x: px, y: py, w1: wire1, w2: wire2} )
                }
            }
        }
    }

    //filter duplicates
    let array = points.filter((v,i,a)=>a.findIndex(v2=>(v.label === v2.label && v.value===v2.value))===i)
    return array
}

function selectedComponents() {
    let components = []
    let nodes = []
    for (let [key, value] of Object.entries(objects)) {
        if (value.highlight) {
            components.push(value)
        }
    }

    for (let [key, wire] of Object.entries(wires)) {
        for (const index in wire.nodes) {
            if (wire.nodes[index].highlight) {
                nodes.push({wireId: wire.nodes[index].id, index: index})
            }
        }
    }
    select.components = components
    select.nodes = nodes
}


nameButton.onclick = function() {
    if (!clickedProxy.object) return
    nameComponent()
}

function nameComponent() {
    if (select.components.length === 0) {
        return
    }

    if (select.components.length === 1) {
        clearHighlight( 'objects' )
        clickedProxy.object.highlight = true;
    }

    nameFormContainer.style.display = "flex";
    document.getElementById("fname").focus()

    document.getElementById('name-form-type').textContent = clickedProxy.object.classname
    
    if (clickedProxy.object.name !== "undefined") {
        document.getElementById('name-form-label').textContent = `Name: ${clickedProxy.object.name}`
    } else {
        document.getElementById('name-form-label').textContent = ''
    }
}

function handleForm(event) { event.preventDefault(); 
    let input = document.getElementById("fname").value;
    const myRe = new RegExp('[\\\/?@#\$\^&*()+=!:;.,\'\"\~\`]', 'gmi');
    const invalid = input.match(myRe);
    if (invalid !== null) {
        alert(`Invalid Character ${invalid}`)
        return
    }
    clickedProxy.object.name = input
    nameFormContainer.style.display = "none";

    document.getElementById("fname").value = ''
} 
window.handleForm = handleForm

const tooltip = document.getElementById("tooltip")
const toolText = document.getElementById("tooltip-text")

const buttons = document.querySelectorAll('.btn')


//tooltip
buttons.forEach(function(currentBtn){
  currentBtn.addEventListener('mouseover', function() {
    if (disableToolTip) return
    let left = getOffset(currentBtn).left;
    let top = getOffset(currentBtn).top;
    tooltip.style.width = "fit-content"
    
    tooltip.style.display = "flex";
    //tooltip.ontransitionend = () => { toolText.textContent = currentBtn.name };
    toolText.textContent = currentBtn.name
    let width = getOffset(currentBtn).width;
    let length = toolText.offsetWidth + 20

    tooltip.style.left = (left - length/2 + width/2 )+"px";
    //settingsMenu.style.left = (left - length/2 + width/2 )+"px";
    tooltip.style.top = (top+50)+"px";
    });
})

function getOffset(el) {
    const rect = el.getBoundingClientRect();

    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    };
  }

buttons.forEach(function(currentBtn){
currentBtn.addEventListener('mouseout', function() {
        tooltip.style.display = "none";
        if (currentBtn.name === 'Select') return
        currentBtn.classList.remove("action-menu-item-highlight");
        currentBtn.classList.remove("action-menu-item-highlight-right");
        currentBtn.classList.remove("action-menu-item-highlight-left");
    });
})

buttons.forEach(function(currentBtn){
    currentBtn.addEventListener('mousedown', function() {
            if (currentBtn.name === 'Settings') {
                currentBtn.classList.add("action-menu-item-highlight-right");
                return
            }
            if (currentBtn.name === 'Undo') {
                currentBtn.classList.add("action-menu-item-highlight-left");
                return
            }
            currentBtn.classList.add("action-menu-item-highlight");
        });
    })

buttons.forEach(function(currentBtn){
    currentBtn.addEventListener('mouseup', function() {
            if (currentBtn.name === 'Select') return
            currentBtn.classList.remove("action-menu-item-highlight");
            currentBtn.classList.remove("action-menu-item-highlight-right");
            currentBtn.classList.remove("action-menu-item-highlight-left");
        });
    })

const welcomeClose = document.getElementById("welcome-close");
addMdi(mdiCloseCircle,welcomeClose, 'white', 24, 24)
const welcome = document.getElementById("welcome");
welcomeClose.onclick = function() {
    welcome.style.display = "none";
}

//right click
document.addEventListener('contextmenu', function(e) {
    rightClickMenu.style.visibility = "visible";
    rightClickMenu.style.left = (e.pageX)+"px";
    rightClickMenu.style.top = (e.pageY - 5)+"px";
    e.preventDefault();
}, false);

//secondary menu
const chevron = document.getElementById("chevron");
addMdi(mdiChevronRight, chevron, 'white', 20, 15, 'chevron')

const options = document.getElementById("options");
const rightClickSecondary = document.getElementById("right-click-secondary");
let hideTimer;
let rightClickSecondaryExit = false;
rightClickSecondary.addEventListener("click", toggleRightClickMenu, false);
options.onmouseover = function() {
    clearTimeout(hideTimer)
    rightClickSecondary.style.visibility = "visible";

    const left = options.getBoundingClientRect().left
    const top = options.getBoundingClientRect().top
    
    rightClickSecondary.style.left = (left + 160)+"px";
    rightClickSecondary.style.top = (top)+"px";
};

options.onmouseout = function() {
    //get cursor trajectory
    const array = []
    let delta = {x: 0, y: 0}
    function set(e) {
        let point = {x: e.screenX, y: e.screenY}
        array.push(point)
        delta.x = e.movementX
        delta.y = e.movementY  
    }

    document.addEventListener('mousemove', set, true);

    setTimeout(function() {
        document.removeEventListener('mousemove', set, true)
        const s = slope(array.pop(), array.shift())
        if (s < -.15 || s > 1.3) rightClickSecondary.style.visibility = "hidden";
        if (delta.y < 2 && delta.x < 1) rightClickSecondary.style.visibility = "hidden";
    }, 70)

};

const undoContext = document.getElementById("undo-context");
undoContext.onmouseover = function() {
    if (rightClickSecondaryExit) rightClickSecondary.style.visibility = "hidden";
    rightClickSecondaryExit = false
    hideTimer = setTimeout(function() {
        rightClickSecondary.style.visibility = "hidden";
    }, 500)
}

rightClickSecondary.onmouseover= function() {
    //clear hide timer
    clearTimeout(hideTimer)
}

rightClickSecondary.onmouseout= function() {
    //exit event
    rightClickSecondaryExit = true;
}

const setClock = document.getElementById("set-clock");
setClock.onclick = function() {
    setClock.style.display = "none";
}


// gets list of nodes and adds nodes to gate
export function defineNodes (id, nodes, object, objects) {
    //set scope
    let self = objects[id]

    for (const node of nodes) {
        if (stringIncludes ('output',node)) {
            Object.defineProperty(object, node, {
                value: new Node(self.id, objects, node),
                writable: true
            });
        }
    }

    for (const node of nodes) {
        let targetObj = new Node(self.id, objects, node)
        //if node is an input, add proxy
        if (stringIncludes ('input',node)) {
            Object.defineProperty(object, node, {
                value: 
                    new Proxy(targetObj, {
                        set: function (target, key, value) {
                            target[key] = value;
                            self.state
                            return true;
                        }
                    }),
                writable: true
            });
        }
    }

    // adds list of nodes to gate
    Object.defineProperty(object, 'nodes', {
        value: nodes,
        writable: true
    });
}


// const animate = async (current, newValue) => {
//     console.log(current.y, newValue)
//     //current.y = newValue
//     for (current.y; current.y < newValue; current.y+=.01) {
//         console.log(current.y)
//         delay(500)
//     }
// }


function animate(current, newValue, n) {
    let i = 0
    const difference = (newValue - current[n])/2
    iterate(current, newValue)
    function iterate (current, newValue) {
        setTimeout(function() {   
        if (easeInOutCirc(i/20) <= .5) {
            current[n] += parseFloat((difference * easeInOutCirc(i/20)*.7303).toFixed(5))
        } else {
            current[n] += parseFloat((difference * (1 - easeInOutCirc(i/20))).toFixed(5))
        }

        i++
        if (i < 20) {        
            iterate(current, newValue);
        }           
        if (i === 20) current[n] = newValue
        }, 4)
    }
  }
