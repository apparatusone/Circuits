'use strict';

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
const selectButton = document.getElementById("select");
const deleteButton = document.getElementById("delete");
const rightClickMenu = document.getElementById("right-click");
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
const testButton = document.getElementById('addTest');

// default zoom
let z = 100;                                            
let objectIndex = 0;
let smoothZoom = z;

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
//let connection = [];         // links between components
let wires = {};              // visual representation of links
let drawingLine = []         // line shown when drawing connection
let drawingRect = []

// add a component
function makeSwitch (x,y,r) {
    let id = generateId()
    let nodes = ['output']
    objects[id] = new OnOffSwitch(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeLed (x,y,r) {
    let id = generateId()
    let nodes = ['input']
    objects[id] = new Led(x, y, r, id)
    defineNodes( id, nodes, objects[id] )
}

function makeClock (x,y,r, frequency = 1000) {
    let id = generateId()
    let nodes = ['output']
    objects[id] = new Clock(x, y, r, id, frequency)
    defineNodes( id, nodes, objects[id] )

    function clock() {
        objects[id].changeState
        setTimeout(clock, frequency);
    };

    clock();
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

function makeNode (x,y,id,io) {
    let node = new Node(id, wires, io)

    Object.defineProperty(node, 'x', {
        value: x,
        writable: true
    });

    Object.defineProperty(node, 'y', {
        value: y,
        writable: true
    });
    return node
}

//makeClock(0,0,0,1000)

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
    }

    if (drawingLine.length > 0) {
        drawTempWire(drawingLine[0])
    }

    // draw wires
    for (let [key, value] of Object.entries(wires)) {
        ctx.setLineDash([]);
        ctx.lineJoin = 'round';
        drawWire(value)
    }

    drawNodes()
    drawNodeHighlight()

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
        console.log(objectUnderCursor.node.x, Math.round(mouse.canvas.x*2)/2)
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

    origin.click.x = e.x;
    origin.click.y = e.y;
    origin.prev.x = origin.x;
    origin.prev.y = origin.y;

    getObject(mouse.canvas.x,mouse.canvas.y)

    // detect right click
    if (e.button === 2) {
        if (objectUnderCursor.isComponent) {
            removeHighlight();
            objectUnderCursor.object.highlight = true;
        }
        rightClick = true;
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

        let node = makeNode(Math.round(mouse.canvas.x*2)/2, Math.round(mouse.canvas.y*2)/2 ,objectUnderCursor.wire.id, 'output')
        objectUnderCursor.wire.nodes.push(node)

    }

    if (!objectUnderCursor.isNode && !objectUnderCursor.isComponent) {
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
            if (isCursorWithinCircle(a, b, 0.1, x, y)) {
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
            if (isCursorWithinCircle(a, b, 0.1, x, y)) {
                objectUnderCursor.isNode = true;
                objectUnderCursor.object = node;
                objectUnderCursor.node = node;
                return; 
            }
        }
    }
    //detect component under cursor
    for (let [key, obj] of Object.entries(objects)) {
        if (isCursorWithinRectangle(obj.x - (obj.w/2), obj.y - (obj.h/2), obj.w, obj.h, x, y)) {
            objectUnderCursor.isComponent = true;
            objectUnderCursor.object = obj;
            return;
        }
    }

    //detect wire under cursor
    for (let [key, w] of Object.entries(wires)) {
        if (pointOnLine (w.loc.a.x, w.loc.a.y, w.loc.b.x ,w.loc.b.y, x, y, .09)) {
            objectUnderCursor.isWire = true;
            objectUnderCursor.wire = w;
            return
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

//returns true if 'a' is in 'b'
function stringInString (a,b) {
    const regex = new RegExp( a, 'gi' );
    return regex.test(b)
}

function pointOnLine (x1,y1,x2,y2,x,y,radius) {
    let a = { x: x1, y: y1 }
    let b = { x: x2, y: y2 }
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

    if (isCursorWithinRectangle(rectx, recty, Math.max(radius, width), Math.max(radius, height), x, y)) {
        if (a.x === b.x) {
            if (Math.abs(a.x - x) < .04) return true;
        }

        if (a.y === b.y) {
            if (Math.abs(a.y - y) < .04) return true;
        }

        //get equation for line
        m = slope(a.x, a.y, b.x, b.y)
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
    deleteComponent(objectUnderCursor.object.id)
}

function toggleRightClickMenu() {
    rightClickMenu.style.display = 'none';
}

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

            drawCircle(a , b, .055, ctx)
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
            drawCircle(a , b, .055, ctx)
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
                drawCircle(a , b, .155, ctx)
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

function isCursorWithinCircle(x, y, r, mouseX, mouseY) {
    var distSqr = Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2);

    if(distSqr < r * r) {
        return true;
    }
    return false;
}

function isCursorWithinRectangle(x, y, w, h, mouseX, mouseY) {
    if(mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        return true;
    }
    return false;
}

function drawCircle(x,y,r,context) {
    context.fillStyle = '#FFFFFF';
    context.setLineDash([]);

    context.beginPath();
    context.arc((-origin.x + x + 0.5)* z, (origin.y - y + 0.5) * z, r*z, 0, 2 * Math.PI);
    context.stroke();
}

function drawWire(wire) {
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = z/20;
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

function slope(x1, y1, x2, y2)
{
    if (x2 - x1 != 0)
    {
        return (y2 - y1) / (x2 - x1);
    }
    return Number.MAX_VALUE;
}

// get minimum and maximum of array
function minMax(items) {
    const map1 = items.map(ele => ele);

    return map1.reduce((acc, val) => {
        acc[0] = ( acc[0] === undefined || val < acc[0] ) ? val : acc[0]
        acc[1] = ( acc[1] === undefined || val > acc[1] ) ? val : acc[1]
        return acc;
    }, []);
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

    shape(x, y, xOrigin, yOrigin, z)

    ctx.restore();
}

function getWireSegments(wire) {
    let queue = []
    // add coordinates of a node to que
    queue.push([wire.node.a.x, wire.node.a.y])
    // add coordinates of each node in node array
    for (const node of wire.nodes) {
        queue.push([node.x,node.y])
    }
    // add coordinates of b node to que
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

                    if (!pointOnLine (p1.x,p1.y,q1.x,q1.y,px,py, .1)) continue
                    if (!pointOnLine (p2.x,p2.y,q2.x,q2.y,px,py, .1)) continue

                    points.push( {x: px, y: py, w1: wire1, w2: wire2} )
                }
            }
        }
    }

    //filter duplicates
    let array = points.filter((v,i,a)=>a.findIndex(v2=>(v.label === v2.label && v.value===v2.value))===i)
    return array
}

function deleteComponent(id) {
    for (let node of objects[id].nodes) {
        deleteWire(objects[id][node].wireId)
    }
    rotateButtons('hide')
    delete objects[id]
}

function deleteWire(id) {
    if (!wires[id]) return

    for (let node of wires[id].nodes) {
        deleteWire(node.wireId)
    }

    let node = { 
        a: wires[id].node.a,
        b: wires[id].node.b,
    }

    wires[id].node.a.wireId = undefined
    wires[id].node.a.connected = false;

    wires[id].node.b.wireId = undefined
    wires[id].node.b.connected = false;
    
    if (stringInString ('input', wires[id].node.a.name)) {
        node.a.setter = 0;
    } else {
        node.b.setter = 0;
    }

    delete wires[id]

    if (node.a.connectionType === objects) {
        objects[node.a.id].state
    }
    if (node.b.connectionType === objects) {
        objects[node.b.id].state
    }
}

//right click
document.addEventListener('contextmenu', function(e) {
    rightClickMenu.style.display = "flex";
    rightClickMenu.style.left = (event.pageX - 10)+"px";
    rightClickMenu.style.top = (event.pageY - 10)+"px";
    e.preventDefault();
}, false);

// FIXME:
// - if screen is resized canvas does not resize
// ✓- highlight isn't on top
// - rotate buttons
// ✓- can't connect to objects[0]
// ✓- can add wire into the same node IMPORTANT
// ✓- pathfinding obstacle detection does not work correctly
//      - can't find path outside of bounds (if no path increase by 1 ?) ✓
// - wires should not be able to intersect ?
//      - or add C hump where lines intersect
// ✓- look at currently drawn objects, get bounds +- 2, 
//      generate grid from bounds and populate with components and wires 
// ✓- detects node in empty cell (something to do with last component being clicked having nodes) 
// ✓- connecting a gate output without wires at each input breaks the program 
// ✓- wire can't be drawn backwards
// - components can be moved into occupied cells
// ✓- gates only work if both nodes have wires
// ✓- can add multiple wires to input.. ?
// ✓- making a latch breaks the program...
// - dragging a component from the menu back to the menu should destroy it
// - component in drag and drop menu don't have nodes
// - change drag and drop menu to use existing onClick function?
// - grid
// - nodes get added to end of wire node list, splice to correct location
// - wire detection breaks when node is added
// - make temporary objects container ( merge drawingline, drawingrect)
// ✓- if a wire is connected to a high wire, its state is not updated
// ✓- adding clock from drag and drop menu causes visual aberrations on added clock
        // no default value for frequency
// - fixed no .name error

// TODO:
// ADD:
// - create IC function
//     - add name component function
// - make wires selectable / add points

// ✓- add clock
// ✓- pathfinding for lines
//      - store on creation so its not recalculated
//      - enable / disable pathfinding (create straight line)
// ✓- drag and drop menu
// - comment code
// ✓- first components: switch & LED
// - open hand cursor when something draggable is under cursor
// - draw cursor when node is under cursor
// - if zoomed out (% ?) disable node selection
// ✓- optimize draw function
// - bespoke outline for component
// - hide rotate buttons if zoom < XX%
// - nodes should show state
// - wire should show state
// - basic undo
// - delete component
// - select and rotate a group of components
// - add transistor
// - add 'power'
// - select and move wire nodes
// - move gui functions to seperate file
// - add component info menu to right side
// - make modules file
// ✓- x to center of canvas
// ✓- add right click menu
// ✓- added delete function for components
// ✓- added drag to select function
// - add right click functions
// - add on hover text to buttons
// - shift click to select multiple components
