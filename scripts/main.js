const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const zoomPercentage = document.getElementById("zoomlevel");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const rotateLeft = document.getElementById("rotate-left");
const rotateRight = document.getElementById("rotate-right");
const undo = document.getElementById("undo");

const gridDot = document.getElementById('source');
//const testbox = document.getElementById('testbox');
const onoff = document.getElementById('onoff');
const andGate = document.getElementById('andgate');
const nandGate = document.getElementById('nandgate');
const orGate = document.getElementById('orgate');
const norGate = document.getElementById('norgate');
const xorGate = document.getElementById('xorgate');
const xnorGate = document.getElementById('xnorgate');
const notGate = document.getElementById('notgate');
const testButton = document.getElementById('addTest');

// default zoom
let z = 100;                                            
let objectIndex = 0;
let smoothZoom = z;

let dragging = false;
let drawing = false;
let mouseDown = false;
let selected = false;

let objectUnderCursor = {
    state: false,
    isComponent: false,
    isNode: false,
    object: undefined,
    node: undefined,
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

// function to generate unique id for components
const idCreator = function* () {
    let i = 1;
    while (true) yield i++;
};
const idsGenerator = idCreator();
const generateId = () => idsGenerator.next().value;

const canvasCenter = {
    x: - Number.parseFloat((canvas.width/(z*2)).toFixed(3)) + 0.5,
    y: Number.parseFloat((canvas.height/(z*2)).toFixed(3)) - 0.5
}

//set origin to center of screen
let origin = {                                         
    x: canvasCenter.x,
    y: canvasCenter.y,
    click: { x:0, y:0 },
    prev: { x:0, y:0 },
    //location of selected element on screen
    selected: { x: 0, y:0, id: undefined}                              
};

// location of cursor
let mouse = {
    screen: { x: 0, y: 0 },
    canvas: { x: 0, y: 0 },
    cell: {x: 0, y: 0}
};

let objects = {};            // components
let connection = [];         // links between components
let wires = [];              // visual representation of links
let drawingLine = []         // line shown when drawing connection

// add a component
function makeSwitch (x,y,r, component) {
    let id = generateId()
    let nodes = ['output']
    objects[id] = new OnOff(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeLed (x,y,r) {
    let id = generateId()
    let nodes = ['input']
    objects[id] = new Led(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeAnd (x,y,r) {
    let id = generateId()
    let nodes = ['input1', 'input2', 'output']
    objects[id] = new AndGate(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeOr (x,y,r) {
    let id = generateId()
    let nodes = ['input1', 'input2', 'output']
    objects[id] = new OrGate(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeNor (x,y,r) {
    let id = generateId()
    let nodes = ['input1', 'input2', 'output']
    objects[id] = new NorGate(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeNand (x,y,r) {
    let id = generateId()
    let nodes = ['input1', 'input2', 'output']
    objects[id] = new NandGate(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeNot (x,y,r) {
    let id = generateId()
    let nodes = ['input', 'output']
    objects[id] = new NotGate(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeXor (x,y,r) {
    let id = generateId()
    let nodes = ['input1', 'input2', 'output']
    objects[id] = new XorGate(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeXnor (x,y,r) {
    let id = generateId()
    let nodes = ['input1', 'input2', 'output']
    objects[id] = new XnorGate(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}


makeSwitch(-1,-2,0)
makeSwitch(0,-2,0)
makeSwitch(1,-2,0)
makeLed(-2,2,0)
makeLed(-1,2,0)
//makeLed(-1,2,0)
//makeLed(0,2,0)
//makeLed(1,2,0)
//makeLed(2,2,0)
makeAnd(-2,0,0)
//makeOr(-1,0,0)
//makeNand(0,0,0)
//makeNor(1,0,0)
//makeNot(2,0,0)
//makeXor(3,0,0)
//makeLed(3,2,0)
//makeXnor(4,0,0)
//makeLed(4,2,0)

let fps;
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

    // draw objects
    for (let [key, value] of Object.entries(objects)) {
        ctx.fillStyle = "rgba(0,0,0,.4)";
        if (value.img === 'svg') drawRotated(value.image, value.gridCoordinates.x, value.gridCoordinates.y, z, z, value.r)
        if (value.img !== 'svg') {
            if (value.state) {
                ctx.fillStyle = value.color;
                drawRotatedImg(value.x, -value.y, value.shape, value.r)
            }
            if (!value.state) {
                ctx.fillStyle = '#FFFFFF';
                drawRotatedImg(value.x, -value.y, value.shape, value.r)
            }
        }
    }

    //highlight selection //TODO: FIXME:
    for (let [key, value] of Object.entries(objects)) {
        if (value.highlight === true) {
            origin.selected.x = value.gridCoordinates.x
            origin.selected.y = value.gridCoordinates.y
            ctx.lineWidth = z/20;
            ctx.strokeStyle = '#26CE00';
            ctx.setLineDash([]);
            ctx.roundRect(value.gridCoordinates.x - z/20,
                            value.gridCoordinates.y - z/20,
                            z*1.1,
                            z*1.1,
                            {upperLeft: z/5,upperRight: z/5,lowerLeft: z/5}, false, true);
            ctx.stroke();
        }
    }

    // show rotate buttons on selected component
    if (selected) {
        locateRotateButtons();
        for (let i = 0; i < wires.length; i++) {
            //wires[i].locateWires();
        }
    }

    drawNodes()

    if (drawingLine.length > 0) {
        drawWire(drawingLine[0])
    }

    // draw wires
    for(let i = 0, l = wires.length; i < l; ++i) {
        ctx.setLineDash([]);
        drawWire(wires[i])
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
    fps = 1/((performance.now() - lastFrame)/1000);

    window.requestAnimationFrame(draw);
}

draw();

canvas.onmousemove = function(e) {
    mouse.canvas.x = Number.parseFloat((e.x / z + origin.x) - .5).toFixed(2);
    mouse.canvas.y = Number.parseFloat((-e.y / z + origin.y) + .5).toFixed(2);

    // move canvas
    if (mouseDown && !dragging && !drawing) {
        origin.x = origin.prev.x + (origin.click.x - e.x)/z;
        origin.y = origin.prev.y - (origin.click.y - e.y)/z;
    };

    // move object
    if (mouseDown && dragging && !drawing) {
        objectUnderCursor.object.x = Math.round(mouse.canvas.x);
        objectUnderCursor.object.y = Math.round(mouse.canvas.y);
    }

    if (drawing === true) {
        drawingLine[0].x2 = (e.x / z - 0.5) + origin.x
        drawingLine[0].y2 = (-e.y / z + 0.5) + origin.y
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
    mouseDown = true;

    origin.click.x = e.x;
    origin.click.y = e.y;
    origin.prev.x = origin.x;
    origin.prev.y = origin.y;

    getObject(mouse.canvas.x,mouse.canvas.y)

    if (objectUnderCursor.isComponent) {
        removeHighlight();
        objectUnderCursor.object.highlight = true;
        dragging = true;
        selected = true;
    }

    if (objectUnderCursor.isNode) {
        drawing = true;
        let id = objectUnderCursor.object.id;
        let node = objectUnderCursor.node;
        let x = objectUnderCursor.object.x;
        let y = objectUnderCursor.object.y;
        drawingLine.push(new TempLine(id, node, x, y));

        drawingLine[0].x2 = (e.x / z - 0.5) + origin.x;
        drawingLine[0].y2 = (-e.y / z + 0.5) + origin.y;
    }

    if (!objectUnderCursor.isNode && !objectUnderCursor.isComponent) {
        removeHighlight();
        selected = false;
        rotateButtons('hide')
    }

    //start timer for mouse click duration
    timerStart = new Date().getTime() / 1000                        
    pointerEventsNone('add');
    canvas.style.cursor = "grabbing";
}

canvas.onmouseup = function(e) {
    e.preventDefault();

    let previousObject = objectUnderCursor.object;
    let previousNode = objectUnderCursor.node;
    getObject(mouse.canvas.x, mouse.canvas.y);

    mouseDown = false;
    //end timer for mouse click duration
    timerEnd = new Date().getTime() / 1000;

    if (objectUnderCursor.isComponent) {
        if (mouseClickDuration(.2)) {
            objectUnderCursor.object.changeState;
        } 
    }

    if (objectUnderCursor.isNode && drawing) {
        connectNodes(previousObject, previousNode)
    }

    if (drawing) drawingLine = [];

    dragging = false;
    drawing = false;
    if (mouseClickDuration(.2) && selected) {
        rotateButtons('unhide')
    }
    pointerEventsNone('remove');
    canvas.style.cursor = "crosshair";
}

function connectNodes(pObject, pNode) {
    let connection = objectUnderCursor.object[objectUnderCursor.node].connection

    if (connection !== undefined || !objectUnderCursor.isNode) {
        return;
    }

    if ( pObject === objectUnderCursor.object ) {
        return
    }

    // if inputs are both inputs or both outputs reject
    if ( stringInString('output', pNode) && stringInString('output', objectUnderCursor.node) ) {
        return
    }

    if ( stringInString('input', pNode) && stringInString('input', objectUnderCursor.node) ) {
        return
    }

    wires.push(new Wire(pObject.id, pNode, pObject.x, pObject.y));

    let id = objectUnderCursor.object.id
    let node = objectUnderCursor.node
    let wireId = wires[(wires.length - 1)].id

    wires[wires.length - 1].index2 = id
    wires[wires.length - 1].node2 = node
    // set connection to wire state
    objects[pObject.id][pNode].connection = wireId
    objects[id][node].connection = wireId
    
}

//returns component and node 
function getObject(x, y) {
    for (const ele in objects) {
        for (const e of objects[ele].nodes) {
            let a = objects[ele][e].x
            let b = objects[ele][e].y
            //.09 is detection radius from center of node
            if (isCursorWithinCircle(a, b, 0.09, x, y)) {
                objectUnderCursor.isComponent = false;
                objectUnderCursor.isNode = true;
                objectUnderCursor.object = objects[ele];
                objectUnderCursor.node = e;
                return; 
            }
        }
    }
    for (let [key, value] of Object.entries(objects)) {
        if (value.x === Math.round(x) && value.y === Math.round(y)) {
            objectUnderCursor.isComponent = true;
            objectUnderCursor.isNode = false;
            objectUnderCursor.object = objects[key];
            objectUnderCursor.node = undefined;
            return;
        }
    }
    objectUnderCursor.isComponent = false;
    objectUnderCursor.isNode = false;
    objectUnderCursor.object = undefined;
    objectUnderCursor.node = undefined;
    return false
}

//returns true if 'a' is in 'b'
function stringInString (a,b) {
    const regex = new RegExp( a, 'gi' );
    return regex.test(b)
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

zoomIn.onclick = function() {
    mouse.screen.x = canvas.width / 2;
    mouse.screen.y = canvas.height /2;
    smoothZoom = Math.min(500, Math.round(smoothZoom + settings.zoomButtons));
    zoomPercentage.innerHTML = Math.round(smoothZoom) + '%';
};

zoomOut.onclick = function() {
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
    rotateLeft.style.left = `${(origin.selected.x - 2/z) - 45}px`;
    rotateLeft.style.top = `${(origin.selected.y - 2/z) - 45}px`;

    rotateRight.style.left = `${(origin.selected.x + z) + 5}px`;
    rotateRight.style.top = `${(origin.selected.y - 2/z) - 45}px`;
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

undo.onclick = function() {
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

// TODO: MAKE A MENU
let buttonCount = -4
testButton.onclick = function() {
    makeGate(buttonCount,-2,0)
    buttonCount++
};

const pointerEventsNone = (x) => {
    let elements = [
        zoomIn,
        zoomOut,
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
function drawLine (x1,y1,x2,y2,width) {
    ctx.lineWidth = z/width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawNodes() {
    for (const ele in objects) {
        for (const e of objects[ele].nodes) {
            let a = objects[ele][e].x
            let b = objects[ele][e].y
            ctx.lineWidth = z/30;
            drawCircle(a , b, .055)
        }
    }
}

// remove 'highlight' from all objects
function removeHighlight () {
    for (let [key, value] of Object.entries(objects)) {
        value.highlight = false;
    }
}

function isCursorWithinCircle(x, y, r, mouseX, mouseY) {
    var distSqr = Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2);

    if(distSqr < r * r) {
        return true;
    }
    return false;
}

function drawCircle(x,y,r) {
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = '#FFFFFF';
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc((-origin.x + x + 0.5)* z, (origin.y - y + 0.5) * z, r*z, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
}

function drawWire(wire) {
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = z/20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo((-origin.x + wire.x1 + 0.5)* z, (origin.y - wire.y1 + 0.5) * z, z, z);
    ctx.lineTo((-origin.x + wire.x2 + 0.5)* z, (origin.y - wire.y2 + 0.5) * z, z, z);
    ctx.stroke();
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, fill, stroke) {
    var cornerRadius = { upperLeft: 0, upperRight: 0, lowerLeft: 0, lowerRight: 0 };
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "object") {
        for (var side in radius) {
            cornerRadius[side] = radius[side];
        }
    }

    this.beginPath();
    this.moveTo(x + cornerRadius.upperLeft, y);
    this.lineTo(x + width - cornerRadius.upperRight, y);
    this.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.upperRight);
    this.lineTo(x + width, y + height - cornerRadius.lowerRight);
    this.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.lowerRight, y + height);
    this.lineTo(x + cornerRadius.lowerLeft, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.lowerLeft);
    this.lineTo(x, y + cornerRadius.upperLeft);
    this.quadraticCurveTo(x, y, x + cornerRadius.upperLeft, y);
    this.closePath();
    if (stroke) {
        this.stroke();
    }
    if (fill) {
        this.fill();
    }
}


function drawRotatedImg(x, y, shape, degrees) {
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

    shape(x, y, xOrigin, yOrigin)

    ctx.restore();
}



// FIXME:
// - if screen is resized canvas does not resize
// ✓- highlight isn't on top
// - rotate buttons
// ✓- can't connect to objects[0]
// ✓- can add wire into the same node IMPORTANT
// ✓- pathfinding obstacle detection does not work correctly
//      - can't find path outside of bounds (if no path increase by 1 ?) ✓
// - wires should not be able to intersect ?
// ✓- look at currently drawn objects, get bounds +- 2, 
//      generate grid from bounds and populate with components and wires 
// ✓- detects node in empty cell (something to do with last component being clicked having nodes) 
// ✓- connecting a gate output without wires at each input breaks the program 
// ✓- wire can't be drawn backwards
// - components can be moved into occupied cells
// - gates only work if both nodes have wires
// - can add multiple wires to input.. ?

// TODO:
// ADD:
// - create IC function
//     - add name component function
//
// ✓- pathfinding for lines
//      - store on creation so its not recalculated
//      - enable / disable pathfinding (create straight line)
// - make lines selectable / add points
// - drag and drop menu
// - comment code
// ✓- first components: switch & LED
// - open hand cursor when something draggable is under cursor
// - draw cursor when node is under cursor
// - if zoomed out (% ?) disable node selection
// - add right click functions
// - optimize draw function
// - bespoke outline for component
// - hide rotate buttons if zoom < XX%
// - nodes should show state
// - wire should show state
// ✓- basic undo

// - move gui functions to seperate file