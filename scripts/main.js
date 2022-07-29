const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingQuality = 'low';

const zoomPercentage = document.getElementById("zoomlevel");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const rotateLeft = document.getElementById("rotate-left");
const rotateRight = document.getElementById("rotate-right");

const gridDot = document.getElementById('source');
const testbox = document.getElementById('testbox');

let z = 100;                                            // zoom
let objectIndex = 0;
let smoothZoom = z;

let dragging = false;
let drawing = false;
let mouseDown = false;
let selected = false;
let settings = {
    smoothZoom: true,                                   // enable/disable smooth zoom
    zoomButtons: 5
};

let start;
let end;

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const canvasCenter = {
    x: - Number.parseFloat((canvas.width/(z*2)).toFixed(3)) + 0.5,
    y: Number.parseFloat((canvas.height/(z*2)).toFixed(3)) - 0.5
}

let origin = {                                          //set origin to center of screen
    x: canvasCenter.x,
    y: canvasCenter.y,
    click: {x:0, y:0},
    prev: {x:0, y:0},
    selected: {x: 0, y: 0}                              //location of selected element on screen
};

let mouse = {
    screen: { x: 0, y: 0 },
    grid: { x: 0, y: 0 },
    cell: {x: 0, y: 0}
};

let objects = []
let wires = []

objects.push(new Box(0, 0, 0))
objects.push(new Box(2, 2, 0))

let fps;
let lastFrame = performance.now();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);   // clear the screen
    ctx.fillStyle = "#fff";                             // background color
    ctx.fillRect(0,0,canvas.width,canvas.height);       // background rectangle

    // grid generation
    if( z > 40 ) {
        for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) { //
            for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
                ctx.drawImage(gridDot, i - z / 12, j - z / 12, z / 6, z / 6);
            };
        };
    };
    if( z < 40 ) {
        ctx.fillStyle = "rgba(0,0,0," + Math.min(1, z / 20) + ")";
        for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) {
            for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
                ctx.fillRect(i - z / 20, j - z / 20, z / 15, z / 15);
            };
        };
    };

    for (const part of objects) {
        ctx.fillStyle = "rgba(0,0,0,.4)";
        drawRotated(part.image, part.gridCoordinatesX(), part.gridCoordinatesY(), z, z, part.r)
        if (part.highlight === true) {
            origin.selected.x = part.gridCoordinatesX()
            origin.selected.y = part.gridCoordinatesY()
            ctx.lineWidth = z/20;
            ctx.strokeStyle = '#26CE00';
            ctx.roundRect(part.gridCoordinatesX() - z/20,
                          part.gridCoordinatesY() - z/20,
                          z*1.1,
                          z*1.1,
                           {upperLeft: z/5,upperRight: z/5,lowerLeft: z/5}, false, true);
            ctx.stroke();
        }
    }

    //highlight selection
    for (const part of objects) {
        if (part.highlight === true) {
            ctx.lineWidth = z/55;
            ctx.strokeStyle = '#26CE00';
            //ctx.setLineDash([z/3, z/15]);
            ctx.roundRect(part.gridCoordinatesX() - z/20,
                          part.gridCoordinatesY() - z/20,
                          z*1.1,
                          z*1.1,
                           {upperLeft: z/5,upperRight: z/5,lowerLeft: z/5}, false, true);
        }
    }

    for(let i = 0, l = wires.length; i < l; ++i) {
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


    if(selected === true) {
        locateRotateButtons();
        wires[0].locateWires();
    }
    window.requestAnimationFrame(draw);
}

draw();

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
    // if (drawing === true) {
    //     wires[0].x2 = e.x / z + origin.x
    //     wires[0].y2 = -e.y / z + origin.y
    // }
};

canvas.onmousewheel = function(e) {
    e.preventDefault();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;

    smoothZoom = Math.min( Math.max(
        smoothZoom - z / 8 * ((e.deltaY) > 0 ? .3 : -.5),
            15), 300                                               //minimum ), maximum zoom                                                        //maximum zoom
    );
    zoomPercentage.innerHTML = Math.round(z) + '%';              //level of current zoom shown on screen
    return false;
}

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
        console.log(node)
        let x = mouse.grid.x + node.location.x
        let y = mouse.grid.y - node.location.y
        //wires.push(new Wire(objectIndex, node, x, y))
    }

    start = new Date().getTime() / 1000
    pointerEventsNone('add');
    canvas.style.cursor = "grabbing";
}

wires.push(new Wire())



canvas.onmouseup = function(e) {
    e.preventDefault();

    mouseDown = false;
    dragging = false;
    drawing = false;

    end = new Date().getTime() / 1000;

    mouseClickDuration();
    pointerEventsNone('remove');
    canvas.style.cursor = "crosshair";
}

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
    smoothZoom = Math.max(15, Math.round(smoothZoom - settings.zoomButtons));
    zoomPercentage.innerHTML = smoothZoom + '%';
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

function mouseClickDuration() {
    if ((end - start) < .2 && selected === true) {
        rotateButtons('unhide');
    }
}

function getNode(index) {
    for (const ele of objects[index].nodes) {
        let x = ele.location.x
        let y = ele.location.y
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


//bugs

//if screen is resized canvas does not resize
//highlight isn't on top