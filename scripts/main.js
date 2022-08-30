'use strict';

import { Wire, TempLine, Node, Led, OnOffSwitch, make, CustomComponent, Clock } from "./parts.js"

import { shape } from "./shapes.js"
//import { mdiPlus, mdiMinus, mdiUndoVariant, mdiSelection, mdiContentSave, } from "../node_modules/@mdi/js/mdi.js";
import { mdiPlus, mdiMinus, mdiUndoVariant, mdiSelection, mdiContentSave, mdiCloseCircle, dltRotate } from './shapes.js';
import { within, drawShape, generateId, stringInString, minMax, slope, capitalize, getClass, modifyIterate } from "./utilities.js";

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


const zoomPercentage = document.getElementById("zoomlevel");
const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");
const rotateLeft = document.getElementById("rotate-left");
const rotateRight = document.getElementById("rotate-right");
const undobutton = document.getElementById("undo");
const selectButton = document.getElementById("select");
const saveButton = document.getElementById("save");
const deleteButton = document.getElementById("delete");
const customComponentButton = document.getElementById("custom-component");
const nameButton = document.getElementById("name-component");
const rightClickMenu = document.getElementById("right-click");
const nameFormContainer = document.getElementById("name-form-container");
const nameForm = document.getElementById("name-form");
rightClickMenu.addEventListener("click", toggleRightClickMenu, false);

const gridDot = document.getElementById('source');
const onoff = document.getElementById('onoff');
const andGate = document.getElementById('andgate');
const nandGate = document.getElementById('nandgate');
const orGate = document.getElementById('orgate');
const norGate = document.getElementById('norgate');
const xorGate = document.getElementById('xorgate');
const xnorGate = document.getElementById('xnorgate');
const notGate = document.getElementById('notgate');
const cc = document.getElementById('cc');




function addMdi(mdi, domObject, color, viewBox, scale) {
    let iconSvg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); //Create a path in SVG's namespace
    const iconPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    
    iconSvg.setAttribute('fill', color);
    iconSvg.setAttribute('viewBox', `0 0 ${viewBox} ${viewBox}`);
    //iconSvg.setAttribute('stroke', 'white');
    iconSvg.classList.add('post-icon');

    iconPath.setAttribute(
    'd',
    mdi
    );
    iconPath.setAttribute('stroke-linecap', 'round');
    iconPath.setAttribute('stroke-linejoin', 'round');
    iconPath.setAttribute('stroke-width', '1');
    iconSvg.appendChild(iconPath);
    iconSvg.setAttribute('width', scale);
    iconSvg.setAttribute('height', scale);
    domObject.appendChild(iconSvg);
}

addMdi(mdiContentSave,saveButton, 'white', 24, 24)
addMdi(mdiSelection,selectButton, 'white', 24, 24)
addMdi(mdiUndoVariant,undobutton, 'white', 24, 24)
addMdi(mdiPlus,zoomInButton, 'white', 24, 24)
addMdi(mdiMinus,zoomOutButton, 'white', 24, 24)
addMdi(dltRotate,rotateLeft, '#222734', 100, 35)
addMdi(dltRotate,rotateRight, '#222734', 100, 35)



// default zoom
export let z = 300;                                            
let objectIndex = 0;
let smoothZoom = z;


//global conditions
let dragging = false;
let drawing = false;
let mouseDown = false;
let rightClick = false;

// function to select components
let select = false;

// TODO: maybe refactor selected variable out
let selected = false;

let objectUnderCursor = {
    state: false,
    isComponent: false,
    isNode: false,
    isWire: false,
    object: undefined,
    node: undefined,
    wire: undefined,
};

let settings = {
    // enable/disable smooth zoom
    smoothZoom: true,      
    // percentage that buttons change zoom level                             
    zoomButtons: 5                                      
};

// timer for mouse click duration
let timerStart;
let timerEnd;

const canvasCenter = {
    x: - Number.parseFloat((window.innerWidth/(z*2)).toFixed(3)) + 0.5,
    y: Number.parseFloat((window.innerHeight/(z*2)).toFixed(3)) - 0.5
}

//set origin to center of screen
export let origin = {                                         
    x: canvasCenter.x,
    y: canvasCenter.y,
    click: { x:0, y:0 },
    prev: { x:0, y:0 },                          
};

// location of cursor
export let mouse = {
    screen: { x: 0, y: 0 },
    canvas: { x: 0, y: 0 },
    cell: {x: 0, y: 0}
};

export let objects = {};            // components
export let wires = {};              // visual representation of links
let drawingLine = []         // line shown when drawing connection
let drawingRect = []

//load from localstorage
loadSave()

// make.led(0,2,0)
// make.switch(-1,-2,0)
// make.switch(1,-2,0)
// make.and(0,0,0)

//let fps;
let lastFrame = performance.now();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);   // clear the screen
    ctx.fillStyle = "#fff";                             // background color
    ctx.fillRect(0,0,canvas.width,canvas.height);       // background rectangle

    // if( z > 40 ) {
    //     for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) { //
    //         for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
    //             ctx.drawImage(gridDot, i - z / 12, j - z / 12, z / 6, z / 6);
    //         };
    //     };
    // };

    // more effecient to render when zoomed out
    if ( z < 40 ) {
        ctx.fillStyle = "rgba(0,0,0," + Math.min(1, z / 20) + ")";
        for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) {
            for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
                ctx.fillRect(i - z / 20, j - z / 20, z / 15, z / 15);
            };
        };
    }

    // main grid
    if( z > 15 ) {
        for (let i = ((-origin.x - 50) * z) % z; i < canvas.width + 50; i+=z) {
            for (let j = ((origin.y - 50) * z) % z; j < canvas.height + 50; j+=z) {
                ctx.strokeStyle = 'rgba(150,150,150,.3)';
                ctx.setLineDash([]);
                drawLine( ((i - z / 20) + .05*z), (j - z / 20), ((i - z / 20) + .05*z), ((j - z / 20) + z), 35);
                drawLine( (i - z / 20), ((j - z / 20) + .05*z), ((i - z / 20) + z), ((j - z / 20) + .05*z), 35);
            }
        }
    }

    // sub grid
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

    //highlight selection //TODO: FIXME:
    for (let [key, value] of Object.entries(objects)) {
        if (value.highlight === true) {
            if (value.img !== 'svg') {
                ctx.lineWidth = z/4;
                ctx.strokeStyle = '#00B6FF';
                ctx.lineJoin = 'round';
                ctx.setLineDash([]);
                ctx.fillStyle = '#00B6FF';
                drawRotatedImg(value.x, -value.y, value.shape, value.r, value.w, value.h)

            }
            ctx.stroke();

            //highlight connected wires
            if (highlightedComponents().length < 2) continue
            for (const node of value.nodes) {
                if (value[node].wireId !== undefined) {
                    ctx.strokeStyle = '#00B6FF';
                    ctx.lineWidth = z/5;
                    drawWire(wires[value[node].wireId])
                }
                
            }
        }
    }
    

    // draw objects
    for (let [key, value] of Object.entries(objects)) {
        ctx.fillStyle = "rgba(0,0,0,.4)";
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = z/15;
        if (value.img === 'svg') drawRotated(value.image, value.gridCoordinates.x, value.gridCoordinates.y, z, z, value.r)
        if (value.img !== 'svg') {
            if (value.state) {
                ctx.fillStyle = value.color;
                drawRotatedImg(value.x, -value.y, value.shape, value.r, value.w, value.h)
            }
            if (!value.state) {
                ctx.fillStyle = '#FFFFFF';
                drawRotatedImg(value.x, -value.y, value.shape, value.r, value.w, value.h)
            }
        }
    }

    // show rotate buttons on selected component
    if (selected && highlightedComponents().length < 2 && objectUnderCursor.isComponent ) {
        locateRotateButtons();
    }

    if (drawingLine.length > 0) {
        drawTempWire(drawingLine[0])
    }

    // draw wires
    for (let [key, value] of Object.entries(wires)) {
        ctx.setLineDash([]);
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = z/20;
        drawWire(value)
    }

    drawNodeHighlight()

    // TODO: rotate text
    // draw custom component
    for (let [key, value] of Object.entries(objects)) {
        if (value.constructor === CustomComponent) {
            if (!value.highlight) continue
            for (let [key, off] of Object.entries(value.offset)) {
                //draw pins
                let pinOffset = .21
                if (off.x > 0) {
                    pinOffset*=-1
                }
                ctx.fillStyle = '#969696'
                shape.pins (off.x + pinOffset + value.x, off.y - value.y, origin.x, origin.y, z, ctx)

                //draw labels
                let x = (-origin.x + .5 + off.x/2.2 + value.x) * z
                let y = (origin.y + .5  + off.y - value.y) * z
                let offsetX = .19
                let offsetY = .084
                let invert = 1
                if (off.x < 0) {
                    invert = -1;
                    offsetX = -.19
                    offsetY = -.084
                }
                let width = invert * (ctx.measureText(key).width + z/4)
                let height = invert * (z/6)
                let radius =  invert * .09

                ctx.fillStyle = 'black'
                ctx.strokeStyle = 'white';
                ctx.lineWidth = z/50;
                shape.roundRectangle(
                    x + z*offsetX, 
                    y - z*offsetY, 
                    width, 
                    height, 
                    {upperLeft: radius*z, upperRight: radius*z, lowerLeft: radius*z, lowerRight: radius*z},
                    true, 
                    true, 
                    ctx)

                let fontSize = z/9
                ctx.fillStyle = 'white'
                ctx.font = `${fontSize}px sans-serif`;

                if (off.x < 0) {
                    ctx.textAlign = 'right'
                    ctx.fillText(key, x-z/2.7, y + z/30);
                } else {
                    ctx.textAlign = 'left'
                    ctx.fillText(key, x+z/2.7, y + z/30);
                }
            }
        }
    }

    drawNodes()

    // draw selection rectangle
    if (select && drawingRect.length) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#006eff';
        ctx.lineCap = 'square';
        ctx.setLineDash([4,15]);
        ctx.beginPath();
        ctx.moveTo(drawingRect[0].x, drawingRect[0].y);
        ctx.lineTo(drawingRect[0].x + drawingRect[0].w, drawingRect[0].y);
        ctx.lineTo(drawingRect[0].x + drawingRect[0].w, drawingRect[0].y + drawingRect[0].h);

        ctx.moveTo(drawingRect[0].x, drawingRect[0].y);
        ctx.lineTo(drawingRect[0].x, drawingRect[0].y + drawingRect[0].h);
        ctx.lineTo(drawingRect[0].x + drawingRect[0].w, drawingRect[0].y + drawingRect[0].h);

        ctx.stroke();
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

    // move canvas
    if (mouseDown && !dragging && !drawing && !select) {
        origin.x = origin.prev.x + (origin.click.x - e.x)/z;
        origin.y = origin.prev.y - (origin.click.y - e.y)/z;
    };

    // move node
    if (objectUnderCursor.node && mouseDown && dragging && !drawing ) {
        objectUnderCursor.node.x = Math.round(mouse.canvas.x*2)/2;
        objectUnderCursor.node.y = Math.round(mouse.canvas.y*2)/2;
        return
    }

    // move object
    if (mouseDown && dragging && !drawing) {
        objectUnderCursor.object.x = Math.round(mouse.canvas.x*2)/2;
        objectUnderCursor.object.y = Math.round(mouse.canvas.y*2)/2;
    }

    if (drawing === true) {
        drawingLine[0].x2 = (e.x / z - 0.5) + origin.x
        drawingLine[0].y2 = (-e.y / z + 0.5) + origin.y
    }

    if (mouseDown) {
        //detectWireIntersection()
    }

    if (select && drawingRect.length) {
        drawingRect[0].w = e.x - origin.click.x
        drawingRect[0].h = e.y - origin.click.y

        // get objects within selected rectangle
        for (let [key, value] of Object.entries(objects)) {
            let x1 = (origin.click.x / z + origin.x) - 0.5
            let y1 = (-origin.click.y / z + origin.y) + 0.5

            if (!((x1 - value.x) * (mouse.canvas.x - value.x) <= 0)) continue
            if (!((y1 - value.y) * (mouse.canvas.y - value.y) <= 0)) continue

            value.highlight = true;
        }

        return
    }
};

canvas.onmousewheel = function(e) {
    e.preventDefault();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;

    smoothZoom = Math.min( Math.max(
        smoothZoom - z / 8 * ((e.deltaY) > 0 ? .3 : -.5),           // TODO: MAKE READABLE
        //minimum ), maximum zoom      
            15), 300
    );

    //level of current zoom shown on screen
    zoomPercentage.innerHTML = Math.round(z) + '%';                 
    return false;
}

canvas.onmousedown = function(e) {
    e.preventDefault();

    //console.log(objects)

    origin.click.x = e.x;
    origin.click.y = e.y;
    origin.prev.x = origin.x;
    origin.prev.y = origin.y;

    getObject(mouse.canvas.x,mouse.canvas.y)

    // detect right click
    if (e.button === 2) {
        rightClick = true;
        if (highlightedComponents().length > 1) {
            return
        }

        if (objectUnderCursor.isComponent) {
            removeHighlight();
            objectUnderCursor.object.highlight = true;
        }
        return
    }

    if (select) {
        drawingRect.push({x: origin.click.x, y: origin.click.y, w: 0, h: 0})
        return
    }

    if (objectUnderCursor.isComponent) {
        removeHighlight();
        objectUnderCursor.object.highlight = true;
        dragging = true;
        selected = true;
    }

    if (objectUnderCursor.isNode) do {
        if (objectUnderCursor.node.highlight) {
            dragging = true;
            selected = true;
            break
        }
        drawing = true;

        //create temporary line with one ends location set to clicked node
        drawingLine.push(new TempLine(objectUnderCursor.node));

        // set seconds ends location to cursor
        drawingLine[0].x2 = (e.x / z - 0.5) + origin.x;
        drawingLine[0].y2 = (-e.y / z + 0.5) + origin.y;
    } while (false)

    if (objectUnderCursor.isWire) {
        let node = make.node(Math.round(mouse.canvas.x*2)/2, Math.round(mouse.canvas.y*2)/2 ,objectUnderCursor.wire.id, 'output')
        //place new node between correct nodes

        let newNodesArray = []
        if (objectUnderCursor.wire.nodes.length < 1) {
            newNodesArray.push(node);
            objectUnderCursor.wire.nodes = newNodesArray;
            return
        }
    
        let wire = objectUnderCursor.wire
        let orderedPoints = [wire.node.a, ...wire.nodes, wire.node.b]
        
        while (orderedPoints.length > 1) {
            // remove first set of node coordinates and assign to variable

            const current = orderedPoints.shift();
            newNodesArray.push(current)

            if (((current.x - node.x) * (orderedPoints[0].x - node.x) <= 0) &&
                ((current.y - node.y) * (orderedPoints[0].y - node.y) <= 0)) {
                    console.log('true')
                    newNodesArray.push(node)
                }
        }

        //remove first node
        newNodesArray.shift()
        
        objectUnderCursor.wire.nodes = newNodesArray
    }

    if (!objectUnderCursor.isNode && !objectUnderCursor.isComponent) {
        nameFormContainer.style.display = "none";
        document.getElementById("fname").value = ''

        rightClickMenu.style.display = "none";
        clearHighlightOnNodes()
        removeHighlight();
        selected = false;
        rotateButtons('hide')
    }

    mouseDown = true;
    //start timer for mouse click duration
    timerStart = new Date().getTime() / 1000                        
    pointerEventsNone('add');
    canvas.style.cursor = "grabbing";
}

canvas.onmouseup = function(e) {
    e.preventDefault();

    let previousNode = objectUnderCursor.node;
    getObject(mouse.canvas.x, mouse.canvas.y);

    mouseDown = false
    //end timer for mouse click duration
    timerEnd = new Date().getTime() / 1000;

    if (select) {
        selectButton.classList.remove("action-menu-item-highlight");
        drawingRect = [];
        select = false;
        return
    }

    if (objectUnderCursor.isComponent) {
        if (mouseClickDuration(.2)) {
            objectUnderCursor.object.changeState;
        } 
    }

    if (objectUnderCursor.isNode) do {
        if (mouseClickDuration(.2)) {
            if (objectUnderCursor.node.connectionType === wires) {
                objectUnderCursor.node.highlight = true;
            }
            break;
        } 
        connectNodes(previousNode)
    } while (false);

    if (drawing) drawingLine = [];

    rightClick = false;
    dragging = false;
    drawing = false;
    if (mouseClickDuration(.2) && selected) {
        rotateButtons('unhide')
    }
    pointerEventsNone('remove');
    canvas.style.cursor = "crosshair";
}

function connectNodes(pNode) {
    if (pNode.connected || objectUnderCursor.node.connected || !objectUnderCursor.isNode) {
        return;
    }

    if ( pNode.id === objectUnderCursor.node.id) {
        return
    }

    // if inputs are both inputs or both outputs reject
    if ( stringInString('output', pNode.name) && stringInString('output', objectUnderCursor.node.name) ) {
        return
    }

    if ( stringInString('input', pNode.name) && stringInString('input', objectUnderCursor.node.name) ) {
        return
    }

    let wire = new Wire( { a: pNode, b: objectUnderCursor.node } );
    wire.id = generateId();
    wires[wire.id] = wire

    pNode.connected = true;
    objectUnderCursor.node.connected = true;
    // set id for wire connected to node
    pNode.wireId = wire.id;
    objectUnderCursor.node.wireId = wire.id;
    wires[wire.id].state

}

function clearHighlightOnNodes() {
    for (let [key, wire] of Object.entries(wires)) {
        for (const node of wire.nodes) {
            node.highlight = false;
        }
    }
}

//returns component and node 
function getObject(x, y) {
    resetStates()
    //detect node under cursor
    for (const ele in objects) {
        for (const e of objects[ele].nodes) {
            let a = objects[ele][e].x
            let b = objects[ele][e].y
            //.09 is detection radius from center of node
            if (within.circle(a, b, 0.1, x, y)) {
                objectUnderCursor.isNode = true;
                objectUnderCursor.object = objects[ele];
                objectUnderCursor.node = objects[ele][e];
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
                objectUnderCursor.isNode = true;
                objectUnderCursor.object = node;
                objectUnderCursor.node = node;
                return; 
            }
        }
    }
    //detect component under cursor
    for (let [key, obj] of Object.entries(objects)) {
        if (within.rectangle(obj.x - (obj.w/2), obj.y - (obj.h/2), obj.w, obj.h, x, y)) {
            objectUnderCursor.isComponent = true;
            objectUnderCursor.object = obj;
            return;
        }
    }

    //detect wire under cursor
    for (let [key, wire] of Object.entries(wires)) {
        for (const segment of getWireSegments(wire)) {
            if (pointOnLine (segment[0],segment[1], x, y, .09)) {
                objectUnderCursor.isWire = true;
                objectUnderCursor.wire = wire;
                return
            }

        }
    }

    function resetStates() {
        objectUnderCursor.isComponent = false;
        objectUnderCursor.isNode = false;
        objectUnderCursor.isWire = false;
        objectUnderCursor.object = undefined;
        objectUnderCursor.node = undefined;
        objectUnderCursor.wire = undefined;
    }
    return false
}

function pointOnLine (p1,p2,x,y,radius) {
    let a,b;

    if (Array.isArray(p1)) {
        a = { x: p1[0], y: p1[1] }
        b = { x: p2[0], y: p2[1] }
    }  else {
        a = p1;
        b = p2;
    }

    let m;
    let rectx;
    let recty;

    let width = minMax([a.x, b.x])[1] - minMax([a.x, b.x])[0]
    let height = minMax([a.y, b.y])[1] - minMax([a.y, b.y])[0]

    if (a.x === b.x) {
        rectx = minMax([a.x, b.x])[0] - .04
    } else {
        rectx = minMax([a.x, b.x])[0]
    }

    if (a.y === b.y) {
        recty = minMax([a.y, b.y])[0] - .04
    } else {
        recty = minMax([a.y, b.y])[0]
    }

    if (within.rectangle(rectx, recty, Math.max(radius, width), Math.max(radius, height), x, y)) {
        if (a.x === b.x) {
            if (Math.abs(a.x - x) < .04) return true;
        }

        if (a.y === b.y) {
            if (Math.abs(a.y - y) < .04) return true;
        }

        //get equation for line
        m = slope( a, b )
        b = -(m*a.x - a.y)
        let line = m*x + b - y

        if (Math.abs(line) < .07) {
            return true;
        }
    }
    return false;
}



//TODO: ORGANIZE

zoomPercentage.innerHTML = Math.round(z) + '%';

// reset canvas to origin
zoomPercentage.onclick = function() {                   
    z = 100;
    smoothZoom = z;
    origin.x = canvasCenter.x;
    origin.y = canvasCenter.y;
    zoomPercentage.innerHTML = Math.round(z) + '%';
};

zoomInButton.onclick = function() {
    mouse.screen.x = canvas.width / 2;
    mouse.screen.y = canvas.height /2;
    smoothZoom = Math.min(500, Math.round(smoothZoom + settings.zoomButtons));
    zoomPercentage.innerHTML = Math.round(smoothZoom) + '%';
};

zoomOutButton.onclick = function() {
    mouse.screen.x = canvas.width / 2;
    mouse.screen.y = canvas.height /2;
    smoothZoom = Math.max(10, Math.round(smoothZoom - settings.zoomButtons));
    zoomPercentage.innerHTML = smoothZoom + '%';
};

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

// TODO: REFACTOR
function locateRotateButtons() {
    rotateLeft.style.left = `${(objectUnderCursor.object.gridCoordinates.x + z/2 - 15) - z/2}px`;
    rotateLeft.style.top = `${(objectUnderCursor.object.gridCoordinates.y ) - 20}px`;

    rotateRight.style.left = `${(objectUnderCursor.object.gridCoordinates.x + z/2 - 16) + z/2}px`;
    rotateRight.style.top = `${(objectUnderCursor.object.gridCoordinates.y ) - 17}px`;
}

rotateRight.onclick = function() {
    const angle = [270, 180, 90, 0];
    const next = (current) => angle[(angle.indexOf(current) + 1) % 4];
    let id = objectUnderCursor.object.id
    objects[id].r = next(objects[id].r);
    objects[id].rotateNodes('left');
}

rotateLeft.onclick = function() {
    const angle = [0, 90, 180, 270];
    const next = (current) => angle[(angle.indexOf(current) + 1) % 4];
    let id = objectUnderCursor.object.id
    objects[id].r = next(objects[id].r);
    objects[id].rotateNodes('right');
}

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

selectButton.onclick = function() {
    if (select) {
        select = false;
        selectButton.classList.remove("action-menu-item-highlight")
    } else {
        select = true;
        selectButton.classList.add("action-menu-item-highlight")
    }
}

deleteButton.onclick = function() {
    if (!objectUnderCursor.object) return
    deleteComponent(objectUnderCursor.object.id, true)
}

saveButton.onclick = function() {
    window.localStorage.clear();

    for (let [key, object] of Object.entries(objects)) {

        if (object.constructor === CustomComponent) {
            storeCustomComponent(object)
            console.log('reject component')
            continue
        }

        if (object.constructor === Clock) {
            console.log('reject clock')
            continue
        }

        storeObject(object)
    }

    for (let [key, wire] of Object.entries(wires)) {

        storeWire(wire)
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

    function storeCustomComponent(component) {
        for (let [key, object] of Object.entries(component.objects)) {
            if (object.constructor === CustomComponent) {
                storeCustomComponent(object)
            }
            storeObject(object)
        }

        for (let [key, wire] of Object.entries(component.wires)) {
            storeWire(wire)
        }

        let nodes = []
        for (const node of component.nodes) {
            nodes.push(component[node])
        }

        let array = []
        for (let [key, object] of Object.entries(component.objects)) {
            array.push(object.id)
        }

        window.localStorage.setItem(component.id, JSON.stringify(
            { 
                'obj': component,
                'nodeList': component.nodes,
                'nodes': nodes,
                'objectIdArray': array
            }, replacer
        ));
    }

    function storeObject(object) {
        let nodes = []

        for (const node of object.nodes) {
            nodes.push(object[node])
        }

        window.localStorage.setItem(object.id, JSON.stringify(
            { 
                'obj': object,
                'nodeList': object.nodes,
                'nodes': nodes 
            }, replacer
        ));
    }

    function storeWire(wire) {

        // nodes

        window.localStorage.setItem(wire.id, JSON.stringify(
            { 
                'wire': wire
            }, replacer
        ));
    }


    // replace 'connectionType' to prevent circular reference
    function replacer(key, value) {
        // Filtering out properties
        if (key === 'connectionType' || key === 'node') {
            console.log('match')
          return undefined;
        }
        return value;
      }
}

function loadSave() {
    // if (!window.localStorage.getItem("1")) return
    for (const [id, string] of Object.entries(localStorage)) {
        if (JSON.parse(string).wire !== undefined) {
            let wire = JSON.parse(string)

            rebuildWire(wire)
        }
    }

    for (const [id, string] of Object.entries(localStorage)) {
        if (id === 'gen') {
            modifyIterate(parseInt(string))
        } else if(JSON.parse(string).wire === undefined) {
            let container = JSON.parse(string)



            if (container.obj.classname === 'CustomComponent') {
                continue
            }

            rebuildObject(container)
        }
    }

    for (const [id, string] of Object.entries(localStorage)) {
        if (id === 'gen') {
            continue
        } else if(JSON.parse(string).wire === undefined) {
            let container = JSON.parse(string)

            if (container.obj.classname === 'CustomComponent') {
                let list = []

                for (const id of container.objectIdArray) {
                    list.push(objects[id])
                }

                let id = makeCustomComponent(list)
                //objects[id] = Object.assign(objects[id], container.obj)

                objects[id].x = container.obj.x
                objects[id].y = container.obj.y
                objects[id].r = container.obj.r

                for (let [key, node] of Object.entries(container.nodes)) {
                    console.log(node)

                    objects[id][node.name].connected = node.connected
                    objects[id][node.name].state = node.state
                    //objects[id][node.name].id = node.id

                    if (node.wireId !== undefined) {
                        objects[id][node.name].wireId = node.wireId
                    }


                    if (node.wireId) {
                        if (wires[node.wireId].node === undefined) {
                            wires[node.wireId].node = {a: undefined, b: undefined}
                        }
                        if (wires[node.wireId].node.a === undefined) {
                            wires[node.wireId].node.a = objects[id][node.name]
                            continue
                        }
                        if (wires[node.wireId].node.b === undefined) {
                            wires[node.wireId].node.b = objects[id][node.name]
                        }
                    }
                }

                continue
            }
        }
    }



    // const array = JSON.parse(window.localStorage.getItem("1"))

    // console.log(array[0].classname)
    // let id = make[array[0].classname.toLowerCase()](0,0,0)

    function rebuildObject(container) {
        const id = container.obj.id
        let objClass = getClass(container.obj.classname)

        objects[id] = Object.assign(new objClass, container.obj)
        
        if (objects[id].img === 'svg') {
            let temp = new objClass
            objects[id].image = temp.image
            //console.log('img',objects[id].image)
        }

        defineNodes( id, container.nodeList, objects[id], objects )

        // set wire.id node a and node b

        for (let [key, node] of Object.entries(container.nodes)) {
            let reNode = Object.assign(objects[id][node.name], node)

            Object.defineProperty(reNode, 'connectionType', {
                value: objects,
                enumerable: true,
                configurable: true
              });

            if (node.wireId) {
                if (wires[node.wireId].node === undefined) {
                    wires[node.wireId].node = {a: undefined, b: undefined}
                }
                if (wires[node.wireId].node.a === undefined) {
                    wires[node.wireId].node.a = reNode
                    continue
                }
                if (wires[node.wireId].node.b === undefined) {
                    wires[node.wireId].node.b = reNode
                }
            }
        }
    }

    function rebuildWire(wire) {
        const id = wire.wire.id
        wires[id] = Object.assign(new Wire, wire.wire)

        Object.defineProperty(wires[id], 'connectionType', {
            value: wires,
            enumerable: true,
            configurable: true
          });
    }

    function rebuildCustomComponent(component) {

    }
}

customComponentButton.onclick = function() {
    let parts = highlightedComponents()
    makeCustomComponent(parts)
}

function toggleRightClickMenu() {
    rightClickMenu.style.display = 'none';
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

function mouseClickDuration(time) {
    if ((timerEnd - timerStart) < time) {
        return true
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
function drawLine (x1, y1, x2, y2, width) {
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
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = z/30;

            drawShape.circle(a , b, .055, ctx)
            ctx.fill();
        }
    }

    //get nodes on wires
    for (let [key, wire] of Object.entries(wires)) {
        for (const node of wire.nodes) {
            let a = node.x
            let b = node.y
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = z/30;
            drawShape.circle(a , b, .055, ctx)
            ctx.fill();
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
                ctx.lineWidth = z/20;
                ctx.strokeStyle = '#26CE00';
                drawShape.circle(a , b, .155, ctx)
            }
        }
    }
}

// remove 'highlight' from all objects
function removeHighlight () {
    for (let [key, value] of Object.entries(objects)) {
        value.highlight = false;
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
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = z/20;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo((-origin.x + wire.x1 + 0.5)* z, (origin.y - wire.y1 + 0.5) * z, z, z);
    ctx.lineTo((-origin.x + wire.x2 + 0.5)* z, (origin.y - wire.y2 + 0.5) * z, z, z);
    ctx.stroke();
}



function drawRotatedImg(x, y, shape, degrees, w = 1, h = 1) {
    ctx.save();

    let a = z/2 + x*z
    let b = z/2 + y*z
    let xOrigin;
    let yOrigin;


    // TODO: REFACTOR
    if (degrees === 0) {
        xOrigin = origin.x;
        yOrigin = origin.y;
    }
    if (degrees === 90) {
        xOrigin = origin.y;
        yOrigin = -origin.x;
    }
    if (degrees === 180) {
        xOrigin = -origin.x;
        yOrigin = -origin.y;
    }
    if (degrees === 270) {
        xOrigin = -origin.y;
        yOrigin = origin.x;
    }

    ctx.translate(a, b)
    ctx.rotate(degrees * -Math.PI / 180);
    ctx.translate(-a, -b)

    shape(x, y, xOrigin, yOrigin, z, w, h, ctx)

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

// id of component, boolean for resetting component states/connections
function deleteComponent(id,reset) {
    for (let node of objects[id].nodes) {
        deleteWire(objects[id][node].wireId,reset)
    }
    //rotateButtons('hide')
    delete objects[id]
}

function deleteWire(id,reset) {
    if (!wires[id]) return

    for (let node of wires[id].nodes) {
        deleteWire(node.wireId)
    }

    let node = {
        a: wires[id].node.a,
        b: wires[id].node.b,
    }

    if(reset) {

        wires[id].node.a.wireId = undefined
        wires[id].node.a.connected = false;

        wires[id].node.b.wireId = undefined
        wires[id].node.b.connected = false;

        if (stringInString('input', wires[id].node.a.name)) {
            node.a.setter = 0;
        } else {
            node.b.setter = 0;
        }
    }

    delete wires[id]

    if (reset) return
 
    if (node.a.connectionType === objects) {
        objects[node.a.id].state
    }
    if (node.b.connectionType === objects) {
        objects[node.b.id].state
    }
}

function highlightedComponents() {
    selected = []
    for (let [key, value] of Object.entries(objects)) {
        if (value.highlight) {
            selected.push(value)
        }
    }
    return selected
}

function makeCustomComponent(parts) {
    // check if switches and led's have names
    for (const part of parts) {
        if (part.constructor === Led || part.constructor === OnOffSwitch) {
            if(part.name === 'undefined') {
                alert('Not all i/o has been named')
                return
            }
        }
    }

    // check if names are unique

    let inputs = []
    let outputs = []

    // get count of inputs and outputs
    for (let [key, io] of Object.entries(parts)) {
        if (io.constructor === OnOffSwitch) {
            inputs.push(io.name)
        }
        if (io.constructor === Led) {
            outputs.push(io.name)
        }
    }

    function heightCalc(h) {
        let height;
        if (h < 2) return 1
        for (let n = 4; n < h + 3; n++) {
            height = ((n >> 1)*.5)
        }
        console.assert(height !== undefined, 'height function error')
        return height
    }

    let width = .5
    //get height of component
    let height = Math.max(1, heightCalc(inputs.length), heightCalc(outputs.length))

    // generate node offsets
    let offsets = {}
    let i = 0
    let value = 0
    while (i < inputs.length) {
        value = Math.abs(value)
        let increments = [.25, 0]
        let pn = [1, -1]
        //if odd
        if ( inputs.length % 2 !== 0 && i === inputs.length - 1) {
            offsets[inputs[i]] = { x: -.5, y: 0}
            i++
            continue
        }
        value+=increments[i%2]
        value=value*pn[i%2]
        offsets[inputs[i]] = { x: -.5, y: value}
        i++
    }
    i = 0
    value = 0
    while (i < outputs.length) {
        value = Math.abs(value)
        let increments = [.25, 0]
        let pn = [1, -1]
        //if odd
        if ( outputs.length % 2 !== 0 && i === outputs.length - 1) {
            offsets[outputs[i]] = { x: 0.5, y: 0}
            i++
            continue
        }
        value+=increments[i%2]
        value=value*pn[i%2]
        offsets[outputs[i]] = { x: .5, y: value}
        i++
    }

    //create component
    let id = generateId()
    let component = new CustomComponent(0, 0, 0, width, height, id) //temp 0,0 for x,y (x,y,r,id)

    //add offsets to component
    component.offset = offsets

    // copy components and wires to custom component
    for (const part of parts) {
        component.objects[part.id] = part
        for (let node of part.nodes) {
            if (part[node].wireId) {
                component.wires[part[node].wireId] = wires[part[node].wireId]
                //moveWire(part[node].wireId)
            }
        }
    }

    //delete components and wires from main objects
    for (const part of parts) {
        deleteComponent(part.id, false)
    }

    // change nodes -> setter, getx, gety
    for (let [key, value] of Object.entries(component.objects)) {
        for (let node of value.nodes) {

            // change scope
            if (value[node].connectionType === objects) {
                value[node].connectionType = component.objects
                //value[node].id = id
            }
            if (value[node].connectionType === wires) {
                value[node].connectionType = component.wires
            }

            Object.defineProperty(value[node], 'setter', {
                set (state) {
                    this.state = state
                    if (this.wireId) component.wires[value[node].wireId].state
                },
                enumerable: true,
                configurable: true
            });
        }
    }

    // change scope of wire nodes
    for (let [key, value] of Object.entries(component.wires)) {
        for (let node of value.nodes) {
            if (node.connectionType === wires) {
                node.connectionType = component.wires
            }

            Object.defineProperty(node, 'setter', {
                set (state) {
                    this.state = state
                    if (this.wireId) component.wires[node.wireId].state
                },
                enumerable: true,
                configurable: true
            });
        }
    }

    for (let [key, io] of Object.entries(component.objects)) {
        if (io.constructor === OnOffSwitch) {
            component.nodes.push(io.name)

            // proxy node that runs changestate on switch on change
            let targetObj = new Node(id, component.objects, io.name)
            //if node is an input, add proxy
            Object.defineProperty(component, io.name, {
                value: 
                    new Proxy(targetObj, {
                        set: function (target, key, value) {
                            console.log(`${key} set to ${value}`);
                            target[key] = value;
                            component.objects[io.id].state = targetObj.state
                            component.objects[io.id].changeState
                            return true;
                        }
                    }),
                enumerable: true,
                configurable: true
            });

            // fix node
            Object.defineProperty(io["output"], 'setter', {
                set (state) {
                    this.state = state
                    if (this.wireId) component.wires[io['output'].wireId].state
                },
                enumerable: true,
                configurable: true
            });

            // fix onoffswitch
            Object.defineProperty(io, 'changeState', {
                get () {
                    this.output.setter = this.state
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(component[io.name], 'name', {
                value: io.name,
                enumerable: true,
                configurable: true
              });

            Object.defineProperty(component[io.name], 'x', {
                get() { return objects[this.id].x + objects[this.id].offset[this.name].x },
                //get() { return 0 },
                enumerable: true,
                configurable: true
              });

              Object.defineProperty(component[io.name], 'y', {
                get() { return objects[this.id].y + objects[this.id].offset[this.name].y },
                //get() { return 0 },
                enumerable: true,
                configurable: true
              });

        }

        //broken replace 'input'
        if (io.constructor === Led) {
            component.nodes.push(io.name)

            //modify led node to propogate change
            let self = io
            console.log(io['input'].wireId)
            let targetObj = new Node(self.id, component.objects, 'input')
            targetObj.wireId = io['input'].wireId

            //recreate node with propogation in handler
            Object.defineProperty(io, 'input', {
                value: 
                    new Proxy(targetObj, {
                        set: function (target, key, value) {
                            target[key] = value;
                            component[io.name].setter = self.state
                            return true;
                        }
                    }),
                writable: true
            });

            // change node on wire
            if (stringInString ('in', component.wires[targetObj.wireId].node.a.name)) {
                component.wires[targetObj.wireId].node.a = io['input']
            } else {
                component.wires[targetObj.wireId].node.b = io['input']
            }

            Object.defineProperty(component, io.name, {
                value: new Node(id, component, io.name),
                enumerable: true,
                configurable: true
              });

            // change 'connected' value of node to false
            Object.defineProperty(component[io.name], 'connected', {
                value: false,
                enumerable: true,
                configurable: true
              });

            Object.defineProperty(component[io.name], 'name', {
                value: io.name,
                enumerable: true,
                configurable: true
              });

            Object.defineProperty(component[io.name], 'x', {
                get() { return objects[this.id].x + objects[this.id].offset[this.name].x },
                enumerable: true,
                configurable: true
              });

              Object.defineProperty(component[io.name], 'y', {
                get() { return objects[this.id].y + objects[this.id].offset[this.name].y },
                enumerable: true,
                configurable: true
              });

        }
        
    }

    objects[id] = component

    //get center of parts for cc x and y

    function moveWire(id) {
        // for (let node of wires[id].nodes) {
        //     moveWire(node.wireId)
        // }
        component.wires[id] = wires[id]
    }
    return id
}


nameButton.onclick = function() {
    if (!objectUnderCursor.object) return
    nameComponent()
}

function nameComponent() {
    if (highlightedComponents().length === 0) {
        return
    }

    if (highlightedComponents().length === 1) {
        removeHighlight();
        objectUnderCursor.object.highlight = true;
    }

    nameFormContainer.style.display = "flex";
    document.getElementById("fname").focus()

    document.getElementById('name-form-type').textContent = objectUnderCursor.object.classname
    
    if (objectUnderCursor.object.name !== "undefined") {
        document.getElementById('name-form-label').textContent = objectUnderCursor.object.name
    } else {
        document.getElementById('name-form-label').textContent = ''
    }
}

function handleForm(event) { event.preventDefault(); 
    let input = document.getElementById("fname").value;
    const myRe = new RegExp('[<>\\\/?@#\$\^&*()+=!:;.,\'\"\~\`]', 'gmi');
    const invalid = input.match(myRe);
    if (invalid !== null) {
        alert(`Invalid Character ${invalid}`)
        return
    }
    objectUnderCursor.object.name = input
    nameFormContainer.style.display = "none";

    document.getElementById("fname").value = ''
} 
window.handleForm = handleForm

const tooltip = document.getElementById("tooltip")
const toolText = document.getElementById("tooltip-text")

const buttons = document.querySelectorAll('.btn')

buttons.forEach(function(currentBtn){
  currentBtn.addEventListener('mouseover', function() {
    let left = getOffset(currentBtn).left;
    let top = getOffset(currentBtn).top;
    tooltip.style.width = "fit-content"
    
    tooltip.style.display = "flex";
    toolText.textContent = currentBtn.name
    let width = getOffset(currentBtn).width;
    let length = toolText.offsetWidth + 20

    tooltip.style.left = (left - length/2 + width/2 )+"px";
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
    rightClickMenu.style.display = "flex";
    rightClickMenu.style.left = (event.pageX - 10)+"px";
    rightClickMenu.style.top = (event.pageY - 10)+"px";
    e.preventDefault();
}, false);

// gets list of nodes and adds nodes to gate
export function defineNodes (id, nodes, object, objects) {
    //set scope
    let self = objects[id]

    for (const node of nodes) {
        if (stringInString ('output',node)) {
            Object.defineProperty(object, node, {
                value: new Node(self.id, objects, node),
                writable: true
            });
        }
    }

    for (const node of nodes) {
        let targetObj = new Node(self.id, objects, node)
        //if node is an input, add proxy
        if (stringInString ('input',node)) {
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
