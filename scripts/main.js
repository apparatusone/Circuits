const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

const zoomPercentage = document.getElementById("zoomlevel");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const rotateLeft = document.getElementById("rotate-left");
const rotateRight = document.getElementById("rotate-right");

const gridDot = document.getElementById('source');
const testbox = document.getElementById('testbox');
const onoff = document.getElementById('onoff');
const testButton = document.getElementById('addTest');


let z = 50;                                            // default zoom
let objectIndex = 0;
let smoothZoom = z;

let dragging = false;
let drawing = false;
let mouseDown = false;
let selected = false;
let settings = {
    smoothZoom: true,                                   // enable/disable smooth zoom
    zoomButtons: 5                                      // percentage buttons change zoom
};

let timerStart;
let timerEnd;

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const canvasCenter = {
    x: - Number.parseFloat((canvas.width/(z*2)).toFixed(3)) + 0.5,
    y: Number.parseFloat((canvas.height/(z*2)).toFixed(3)) - 0.5
}

//TODO: ORGANIZE
let origin = {                                          //set origin to center of screen
    x: canvasCenter.x,
    y: canvasCenter.y,
    click: {x:0, y:0},
    prev: {x:0, y:0},
    selected: {x: 0, y: 0}                              //location of selected element on screen
};

//TODO: ORGANIZE
let mouse = {
    screen: { x: 0, y: 0 },
    grid: { x: 0, y: 0 },
    cell: {x: 0, y: 0}
};

let objects = []
let wires = []

// TODO: TESTPOINTS

const points =   [[0,0],
                  [2, 0],
                  [2,-4]]


objects.push(new Box(0, 3, 0))
objects.push(new Box(0, -4, 0))
// objects.push(new Box(-3, -2, 0))
// objects.push(new Box(0, 1, 0))
// objects.push(new Box(21, 1, 0))

objects.push(new OnOff(0, 0, 0))


let fps;
let lastFrame = performance.now();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);   // clear the screen
    ctx.fillStyle = "#fff";                             // background color
    ctx.fillRect(0,0,canvas.width,canvas.height);       // background rectangle

    // //TODO: create function for grid generation
    // grid generation

    function gridGeneration(zBound, offset, draw) {
        if ( zBound ) {
            for (let i = ((-origin.x - offset) * z) % z; i < canvas.width + offset; i+=z) {
                for (let j = ((origin.y - offset) * z) % z; j < canvas.height + offset; j+=z) {
                    draw;
                };
            };
        };
    }

  
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
    };

    if( z > 15 ) {
        for (let i = ((-origin.x - 50) * z) % z; i < canvas.width + 50; i+=z) {
            for (let j = ((origin.y - 50) * z) % z; j < canvas.height + 50; j+=z) {
                ctx.strokeStyle = 'rgba(150,150,150,.2)';
                ctx.lineWidth = z/35;
                ctx.beginPath();
                ctx.moveTo((i - z / 20) + .05*z, (j - z / 20));
                ctx.lineTo((i - z / 20) + .05*z, (j - z / 20) + z);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo((i - z / 20), (j - z / 20) + .05*z);
                ctx.lineTo((i - z / 20) + z, (j - z / 20) + .05*z);
                ctx.stroke();
            }
        }
    }
    
    for (const part of objects) {
        ctx.fillStyle = "rgba(0,0,0,.4)";
        drawRotated(part.image, part.gridCoordinatesX(), part.gridCoordinatesY(), z, z, part.r)
    }

    // TODO: set 'part' to variable so there isnt another loop every redraw
    //highlight selection
    for (const part of objects) {
        if (part.highlight === true) {
            origin.selected.x = part.gridCoordinatesX()
            origin.selected.y = part.gridCoordinatesY()
            ctx.lineWidth = z/20;
            ctx.strokeStyle = '#26CE00';
            //ctx.setLineDash([z/3, z/15]);
            ctx.roundRect(part.gridCoordinatesX() - z/20,
                          part.gridCoordinatesY() - z/20,
                          z*1.1,
                          z*1.1,
                           {upperLeft: z/5,upperRight: z/5,lowerLeft: z/5}, false, true);
            ctx.stroke();
        }
    }

    // TODO: REFACTOR
    if (selected === true) {
        locateRotateButtons();
        for (let i = 0; i < wires.length; i++) {
            wires[i].locateWires();
        }
    }

    for(let i = 0, l = wires.length; i < l; ++i) {
        drawWire(wires[i])
    }

    // TODO: PATHFINDING LINES
    wirePathfinding(objects[0],objects[1])


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



// TODO: REFACTOR
canvas.onmousemove = function(e) {
    mouse.grid.x = Math.round((e.x / z + origin.x) - .5);
    mouse.grid.y = Math.round((-e.y / z + origin.y) + .5);

    if (mouseDown && dragging === false) {
        origin.x = origin.prev.x + (origin.click.x - e.x)/z;
        origin.y = origin.prev.y - (origin.click.y - e.y)/z;
    };
    if (mouseDown && dragging === true && drawing === false) {
        objects[objectIndex].x = mouse.grid.x;
        objects[objectIndex].y = mouse.grid.y;
    }
    if (drawing === true) {

        // TODO: REFACTOR
        currentWire = (wires.length - 1)
        wires[currentWire].x2 = (e.x / z - 0.5) + origin.x
        wires[currentWire].y2 = (-e.y / z + 0.5) + origin.y
    }
};

canvas.onmousewheel = function(e) {
    e.preventDefault();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;

    smoothZoom = Math.min( Math.max(
        smoothZoom - z / 8 * ((e.deltaY) > 0 ? .3 : -.5),           // TODO: MAKE READABLE
            15), 300                                                //minimum ), maximum zoom                                                        //maximum zoom
    );

    zoomPercentage.innerHTML = Math.round(z) + '%';                 //level of current zoom shown on screen
    return false;
}


// TODO: REFACTOR
canvas.onmousedown = function(e) {
    e.preventDefault();
    mouseDown = true;

    origin.click.x = e.x;
    origin.click.y = e.y;
    origin.prev.x = origin.x;
    origin.prev.y = origin.y;

    mouse.cell.x = Math.round((((e.x / z + origin.x) - mouse.grid.x) - 0.5 % 1)*100)/100
    mouse.cell.y = Math.round((((e.y / z - origin.y) + mouse.grid.y) - 0.5 % 1)*100)/100

    if (typeof objectUnderMouse(mouse.grid.x,mouse.grid.y) === 'number') {
        dragging = true;
        objects[objectIndex].highlight = false;
        objectIndex = objectUnderMouse(mouse.grid.x,mouse.grid.y);
        objects[objectIndex].highlight = true;
        selected = true;
    } else if (typeof objectUnderMouse(mouse.grid.x,mouse.grid.y) !== 'number') {
        objects[objectIndex].highlight = false;
        selected = false;
        rotateButtons('hide')
    }

    if (getNode(objectIndex)) {
        drawing = true;
        let node = getNode(objectIndex)
        let x1 = objects[objectIndex].nodes[node].x
        let y1 = objects[objectIndex].nodes[node].y
        wires.push(new Wire(objectIndex, node, x1, y1))

// TODO: REFACTOR
        currentWire = (wires.length - 1)
        wires[currentWire].x2 = (e.x / z - 0.5) + origin.x
        wires[currentWire].y2 = (-e.y / z + 0.5) + origin.y
    }

    timerStart = new Date().getTime() / 1000                        //start timer for mouse click duration
    pointerEventsNone('add');
    canvas.style.cursor = "grabbing";
}

canvas.onmouseup = function(e) {
    e.preventDefault();

    mouseDown = false;
    timerEnd = new Date().getTime() / 1000;                          //end timer for mouse click duration

    mouse.cell.x = Math.round((((e.x / z + origin.x) - mouse.grid.x) - 0.5 % 1)*100)/100
    mouse.cell.y = Math.round((((e.y / z - origin.y) + mouse.grid.y) - 0.5 % 1)*100)/100

    //TODO: ORGANIZE
    let index = objectUnderMouse(mouse.grid.x,mouse.grid.y)
    
    //TODO: REFACTOR
    if (index && drawing === true) {
        let node = getNode(index)
        currentWire = (wires.length - 1)
        if (node !== undefined) {
            wires[currentWire].index2 = index
            wires[currentWire].node2 = node
        } else {
            wires.pop()
        }
    } else if (!index && drawing === true) {
        wires.pop()
    }

    dragging = false;
    drawing = false;
    mouseClickDuration();
    pointerEventsNone('remove');
    canvas.style.cursor = "crosshair";
}

// TODO: ORGANIZE
zoomPercentage.innerHTML = Math.round(z) + '%';

zoomPercentage.onclick = function() {                   // reset canvas to origin
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

// TODO: MAKE A MENU
let buttonCount = -4
testButton.onclick = function() {
    objects.push(new Box(buttonCount, -5, 0))
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

const objectUnderMouse = (x, y) => {
    for (const part of objects) {
        if (part.x === x && part.y === y) return objects.indexOf(part);
    }
    return false
};

function drawRotated(image, x, y, w, h, degrees) {
    ctx.save();
    ctx.translate(x+(image.width/200)*z, y+(image.width/200)*z);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.translate((-image.width/200)*z, ((-image.height/200)*z));
    ctx.drawImage(image, 0, 0, w, h);
    ctx.restore();
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

// TODO: REFACTOR
function locateRotateButtons() {
    rotateLeft.style.left = `${(origin.selected.x - 2/z) - 45}px`;
    rotateLeft.style.top = `${(origin.selected.y - 2/z) - 45}px`;

    rotateRight.style.left = `${(origin.selected.x + z) + 5}px`;
    rotateRight.style.top = `${(origin.selected.y - 2/z) - 45}px`;
}

rotateLeft.onclick = function() {
    const angle = [270, 180, 90, 0];
    const next = (current) => angle[(angle.indexOf(current) + 1) % 4];
    objects[objectIndex].r = next(objects[objectIndex].r);
    objects[objectIndex].rotateNodes('left');
}

rotateRight.onclick = function() {
    const angle = [0, 90, 180, 270];
    const next = (current) => angle[(angle.indexOf(current) + 1) % 4];
    objects[objectIndex].r = next(objects[objectIndex].r);
    objects[objectIndex].rotateNodes('right');
}

// TODO: GENERALIZE
function mouseClickDuration() {
    if ((timerEnd - timerStart) < .2 && selected === true) {
        rotateButtons('unhide');
    }
}

function getNode(index) {
    for (const ele in objects[index].nodes) {
        let x = objects[index].nodes[ele].x
        let y = objects[index].nodes[ele].y
        if (isCursorWithinCircle(x, y, 0.08, mouse.cell.x, mouse.cell.y)) return ele; //.08 is radius around center of node
    }
}

function isCursorWithinCircle(x, y, r, mouseX, mouseY) {
    var distSqr = Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2);

    if(distSqr < r * r) {
        return true;
    }
    return false;
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

function line(x1,y1,x2,y2) {
    ctx.moveTo((-origin.x + x1 + 0.5)* z, (origin.y - y1 + 0.5) * z, z, z);
    ctx.lineTo((-origin.x + x2 + 0.5)* z, (origin.y - y2 + 0.5) * z, z, z);
}

function drawCircle(x1,y1) {
    ctx.lineWidth = z/35;
    ctx.fillStyle = '#FFFFFF';

    ctx.beginPath();
    ctx.arc((-origin.x + x1 + 0.5)* z, (origin.y - y1 + 0.5) * z, .06*z, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawWireRouted(array) {
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = z/20;
    ctx.lineCap = 'round';
    ctx.beginPath();

    for (let i = 0; i < array.length - 1; i++) {
        let p1 = array[i]
        let p2 = array[i+1]

        line(p1[0],p1[1],p2[0],p2[1])
        //ctx.stroke();
        //drawCircle(p1[0],p1[1])
    }
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

function minMax(items,a) {
    const map1 = items.map(ele => ele[a]);

    return map1.reduce((acc, val) => {
        acc[0] = ( acc[0] === undefined || val < acc[0] ) ? val : acc[0]
        acc[1] = ( acc[1] === undefined || val > acc[1] ) ? val : acc[1]
        return acc;
    }, []);
}

function wirePathfinding(a,b) {

    const min = { x: minMax(objects,'x')[0], y: minMax(objects,'y')[0]};  // get bounds for pathfinding grid
    const max = { x: minMax(objects,'x')[1], y: minMax(objects,'y')[1]};
    
    let gx = Math.abs( max.x - min.x ) + 3;                               // +3 so pathfinding grid is never a line
    let gy = Math.abs( max.y - min.y ) + 3;

    let offsety = max.y * -1;

    subdivide = 1;                                                        // change to subdivide pathfinding grid
    divide = { a: subdivide, b: 1/subdivide };

    let graphArray = Array.from({length: gy * divide.a}, () => Array(gx * divide.a).fill(1)); //generate array 


    for (let i of objects) {                                            //locate obstacles
        let cell = {x:0,y:0}
        cell.x = Math.abs(min.x - i.x) * divide.a + 1;          // +1 is to offset grid for pathfinding objects in a line
        cell.y = Math.abs(offsety + i.y) * divide.a + 1;
        if (i !== objects[0] && i !== objects[1]) {
                graphArray[cell.y].splice(cell.x, 1, 0);
            }
    }

    let graph = new Graph(graphArray)

    const start = graph.grid[Math.abs(offsety + a.y)*divide.a + 1][Math.abs(min.x - a.x)*divide.a + 1];    //flip x and y [y][x]
    const end = graph.grid[Math.abs(offsety + b.y)*divide.a + 1][Math.abs(min.x - b.x)*divide.a + 1];        
    const result = astar.search(graph, start, end, true);

    let array2 = [[(Math.abs(min.x - a.x)*divide.b + min.x), - Math.abs(offsety + a.y)*divide.b + max.y]]

    for (let i of result) {
        array2.push([(i.y*divide.b + min.x) - 1, (-i.x*divide.b + max.y) + 1])                          //undo - flip x and y [x][y]
    }

    drawWireRouted(reduceArray(array2))

}

wirePathfinding(objects[0],objects[1])


function reduceArray (array) {
	const stack = [ array[0] ];
    const lng = array.length

    for (let i = 0; i < lng - 2 ; i++) {
        if (array[i][0] !== array[i+2][0] && array[i][1] !== array[i+2][1] ) {
            stack.push(array[i+1])
        }
    }
    stack.push(array[lng - 1])
    return stack;
};


// FIXME:
// - if screen is resized canvas does not resize
// - highlight isn't on top ✓
// - rotate buttons
// - can't connect to objects[0]
// - can add wire into the same node
// - pathfinding obstacle detection does not work correctly ✓
//      - can't find path outside of bounds (if no path increase by 1 ?) ✓
// - wires should not be able to intersect ?
// - look at currently drawn objects, get bounds +- 2, ✓
//      generate grid from bounds and populate with components and wires ✓
// - detects node in empty cell


// TODO:
// ADD:
// - pathfinding for lines
//      - store on creation so its not recalculated
//      - enable / disable pathfinding (create straight line)
// - make lines selectable / add points
// - drag and drop menu
// - comment code
// - first components: switch & LED
// - open hand cursor when something draggable is under cursor
// - draw cursor when node is under cursor
// - if zoomed out disaable node selection

// - move gui functions to seperate file

