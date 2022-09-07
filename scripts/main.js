'use strict';

import { Wire, TempLine, Node, Led, OnOffSwitch, make, CustomComponent, Clock } from "./parts.js"

import { shape } from "./shapes.js"
//import { mdiPlus, mdiMinus, mdiUndoVariant, mdiSelection, mdiContentSave, } from "../node_modules/@mdi/js/mdi.js";
import { mdiPlus, mdiMinus, mdiUndoVariant, mdiSelection, mdiContentSave, mdiCloseCircle, mdiCog, dltRotate } from './shapes.js';
import { within, drawShape, generateId, stringIncludes, minMax, slope, capitalize, getClass, color, radians } from "./utilities.js";

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
const settingsButton = document.getElementById("settings");
const settingsMenu = document.getElementById("settings-menu");
const darkModeBox = document.getElementById("menu-darkmode");
const showLabelsBox = document.getElementById("menu-show-labels");
const customComponentButton = document.getElementById("custom-component");
const nameButton = document.getElementById("name-component");
const saveComponentButton = document.getElementById("save-component");
const rightClickMenu = document.getElementById("right-click");
const nameFormContainer = document.getElementById("name-form-container");
const nameForm = document.getElementById("name-form");
rightClickMenu.addEventListener("click", toggleRightClickMenu, false);

function addMdi(mdi, domObject, color, viewBox, scale, cssClass) {
    let iconSvg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); //Create a path in SVG's namespace
    const iconPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    
    iconSvg.setAttribute('fill', color);
    iconSvg.setAttribute('viewBox', `0 0 ${viewBox} ${viewBox}`);
    iconSvg.classList.add(cssClass);

    iconPath.setAttribute('d', mdi);
    iconPath.setAttribute('stroke-linecap', 'round');
    iconPath.setAttribute('stroke-linejoin', 'round');
    iconPath.setAttribute('stroke-width', '1');
    iconSvg.appendChild(iconPath);
    iconSvg.setAttribute('width', scale);
    iconSvg.setAttribute('height', scale);
    domObject.appendChild(iconSvg);
}

addMdi(mdiContentSave,saveButton, color.icon, 24, 24, 'post-icon')
addMdi(mdiSelection,selectButton, color.icon, 24, 24, 'post-icon')
addMdi(mdiUndoVariant,undobutton, color.icon, 24, 24, 'post-icon')
addMdi(mdiPlus,zoomInButton, color.icon, 24, 24, 'post-icon')
addMdi(mdiMinus,zoomOutButton, color.icon, 24, 24, 'post-icon')
addMdi(mdiCog,settingsButton, color.icon, 24, 24, 'post-icon')
addMdi(dltRotate,rotateLeft, color.rotate, 100, 35, 'rotate')
addMdi(dltRotate,rotateRight, color.rotate, 100, 35, 'rotate')

// default zoom
window.z = 100;
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

window.settings = {
    // is settings menu open
    open: false,
    smoothZoom: true,      
    // increment that buttons change zoom level                             
    zoomButtons: 5,
    darkMode: false,      
    showLabels: false,                           
};

// timer for mouse click duration
let timerStart;
let timerEnd;

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
    cell: {x: 0, y: 0}
};

window.objects = {};            // components
window.wires = {};              // visual representation of links
window.savedComponents = {}
let drawingLine = []         // line shown when drawing connection
let drawingRect = []

//load from localstorage
loadSave()
//set gui colors
color.update()

make.led(0,2,0)
make.and(0,0,0)
make.switch(-1,-2,0)
make.switch(1,-2,0)
make.label(1,0,0)
make.label(-1.5,-1,0)
//objects[5].state = 1
objects[5].name = 'And Gate'
objects[6].name = 'Connect remaining nodes'
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
    ctx.fillStyle = "rgba(0,0,0," + Math.min(1, z / 20) + ")";

    let i;
    for (i = (-origin.x * z) % z; i < canvas.width; i+=z) {
        //ctx.fillRect(i - z / 40, j - z / 40, z / 20, z / 20);
    };

    for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
        ctx.fillRect(i - z / 40, j - z / 40, z / 20, z / 20);
    };

    if ( z < 40 ) {
        ctx.fillStyle = "rgba(0,0,0," + Math.min(1, z / 20) + ")";
        for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) {
            for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
                ctx.fillRect(i - z / 40, j - z / 40, z / 20, z / 20);
            };
        };
    }

    // TODO: simplify grid generation
    // FIXME: very slow on zoom out
    //main grid
    if( z > 15 ) {
        for (let i = ((-origin.x - 50) * z) % z; i < canvas.width + 50; i+=z) {
            for (let j = ((origin.y - 50) * z) % z; j < canvas.height + 50; j+=z) {
                ctx.strokeStyle = color.grid;
                ctx.setLineDash([]);
                // x1,y1, x2, y2, linewidth
                drawLine( ((i - z / 20) + .05*z), (j - z / 500), ((i - z / 20) + .05*z), ((j - z / 500) + z), 55);
                drawLine( (i - z / 500), ((j - z / 20) + .05*z), ((i - z / 500) + z), ((j - z / 20) + .05*z), 55);
            }
        }
    }

    // DOESN'T cause slow down on zoom out
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
                drawRotatedImg(value, value.shape, value.w, value.h)

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
        ctx.strokeStyle = color.line;
        ctx.lineWidth = z/15;
        if (value.img === 'svg') drawRotated(value.image, value.gridCoordinates.x, value.gridCoordinates.y, z, z, value.r)
        if (value.img !== 'svg') {
            //if (value.constructor === CustomComponent) continue
            if (value.state) {
                ctx.fillStyle = value.color;
                drawRotatedImg(value, value.shape, value.w, value.h)
            }
            if (!value.state) {
                ctx.fillStyle = color.object;
                drawRotatedImg(value, value.shape, value.w, value.h)
            }
        }
    }

    // show rotate buttons on selected component
    if (selected && highlightedComponents().length < 2 && objectUnderCursor.isComponent ) {
        locateRotateButtons(objectUnderCursor.object);
    }

    // draw wires
    for (let [key, value] of Object.entries(wires)) {
        ctx.setLineDash([]);
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color.line;
        ctx.lineWidth = z/20;
        drawWire(value)
    }

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
                // location of pins
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
            // draw labels
            for (let [key, off] of Object.entries(value.offset)) {
                let invert = 1
                if (off.x < 0) {
                    if  (value.r === 0 || value.r === 180) {
                        invert = -1;
                    }
                }

                if (off.y < 0) {
                    if  (value.r === 90 || value.r === 270) {
                        invert = -1;
                    }
                }
                
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
    if (select && drawingRect.length) {
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
    resetSettingsMenu()
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
    if ( stringIncludes('output', pNode.name) && stringIncludes('output', objectUnderCursor.node.name) ) {
        return
    }

    if ( stringIncludes('input', pNode.name) && stringIncludes('input', objectUnderCursor.node.name) ) {
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
        if (within.rectangle(obj.x - (obj.hitbox.w/2), obj.y - (obj.hitbox.h/2), obj.hitbox.w, obj.hitbox.h, x, y)) {
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

zoomInButton.onmousedown = function() {
    zoomInButton.classList.add("action-menu-item-highlight");
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

saveComponentButton.onclick = function() {
    let custom = {}
    const object = objectUnderCursor.object

    if (highlightedComponents().length > 1) {
        alert("can only save 1 component")
        return
    }

    if (object.constructor !== CustomComponent) {
        alert("object is not a Custom Component")
        return
    }

    storeCustomComponent(objectUnderCursor.object)

    function storeCustomComponent(component) {

        custom[component.id] = JSON.stringify(
            { 
                'type': 'customcomponent',
                'component': component,
                'list': Object.keys(component.objects)
            }, replacer
        );

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

    buildComponent(custom)
}

function buildComponent(custom) {
    let parsed = {}


    // FIXME:
    // safari does not support lookbehind in JS regular expressions
    const regexId = /(?<="id":|"id":"|"wireId":|"wireId":")\d+/gm
    const regexList = /(?<=list.*)\d+(?<!\]}.*)/gm
    const wireKey = /(?<=wires":{"|},")\d+(?=":{"nodeState")/mg

    // increment all id's and key's by current iterate
    for (let [key, json] of Object.entries(custom)) {
        let id = parseInt(key) + parseInt(iterate) - 1
        custom[id] = json.replace(regexId, replacer)
        custom[id] = custom[id].replace(regexList, replacer)
        custom[id] = custom[id].replace(wireKey, replacer)

        delete custom[key];
    }

    function replacer(match, p1, p2, p3, offset, string) {
        return (parseInt(match) + parseInt(iterate) - 1) 
      }

    for (const [key, string] of Object.entries(custom)) {
        parsed[key] = JSON.parse(string)
    }


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

    const id = Object.keys(parsed).reduce((a, b) => parsed[a] > parsed[b] ? a : b)
    iterate = parseInt(id) + 1
}

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
}

function loadSave() {
    if (window.localStorage.length < 1) return

    let parsed = {}
    for (const [id, string] of Object.entries(localStorage)) {
        parsed[id] = JSON.parse(string)
    }

    for (const [id, object] of Object.entries(parsed)) {
        // adguard adds object to localstorage; ignore
        if(stringIncludes('_',id)) continue

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
    let parts = highlightedComponents()
    const id = generateId()
    let cc = makeCustomComponent(parts, id)
    objects[id] = cc
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
    ctx.lineWidth = z/20;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo((-origin.x + wire.x1 + 0.5)* z, (origin.y - wire.y1 + 0.5) * z, z, z);
    ctx.lineTo((-origin.x + wire.x2 + 0.5)* z, (origin.y - wire.y2 + 0.5) * z, z, z);
    ctx.stroke();
}

function drawRotatedImg(value, shape, w = 1, h = 1) {
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

    shape(value.x, -value.y, xOrigin, yOrigin, z, w, h, ctx, value)

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

        if (stringIncludes('input', wires[id].node.a.name)) {
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

function makeCustomComponent(parts, id) {
    // check if switches and led's have names
    for (const part of parts) {
        if (part.constructor === Led || part.constructor === OnOffSwitch) {
            if (part.name === 'undefined') {
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
    let component = new CustomComponent(0, 0, 0, width, height, id) //temp 0,0 for x,y (x,y,r,id)

    //add offsets to component
    component.offset = offsets

    // copy components and wires to custom component
    for (const part of parts) {
        component.objects[part.id] = part
        for (let node of part.nodes) {
            if (part[node].wireId) {
                component.wires[part[node].wireId] = wires[part[node].wireId]
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
            
            // sets internal node locations to [0,0]
            Object.defineProperty(value[node], 'x', {
                value: 0,
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(value[node], 'y', {
                value: 0,
                enumerable: true,
                configurable: true
            });

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
                enumerable: true,
                configurable: true
              });

              Object.defineProperty(component[io.name], 'y', {
                get() { return objects[this.id].y + objects[this.id].offset[this.name].y },
                enumerable: true,
                configurable: true
              });

        }

        //broken replace 'input'
        if (io.constructor === Led) {
            component.nodes.push(io.name)

            //modify led node to propogate change
            let self = io
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
            if (stringIncludes ('in', component.wires[targetObj.wireId].node.a.name)) {
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

    //get center of parts for cc x and y

    function moveWire(id) {
        // for (let node of wires[id].nodes) {
        //     moveWire(node.wireId)
        // }
        component.wires[id] = wires[id]
    }
    return component
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
        document.getElementById('name-form-label').textContent = `Name: ${objectUnderCursor.object.name}`
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
