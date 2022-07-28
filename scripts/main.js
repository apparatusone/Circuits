const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingQuality = 'low';

const zoomPercentage = document.getElementById("zoomlevel");
const zoomIn = document.getElementById("zoom-in")
const zoomOut = document.getElementById("zoom-out")

const gridDot = document.getElementById('source');

let z = 100;                                            // zoom
let smoothZoom = z;

let dragging = false;
let drawing = false;
let mouseDown = false;
let settings = {
    smoothZoom: true,                                   // enable/disable smooth zoom
    zoomButtons: 5
}

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let origin = {                                          //set origin to center of screen
    x: - Math.round(canvas.width/(z*2)),
    y: Math.round(canvas.height/(z*2)),
    click: {x:0, y:0},
    prev: {x:0, y:0}
};

let mouse = {
    screen: { x: 0, y: 0 },
    grid: { x: 0, y: 0 },
    cell: {x: 0, y: 0}
};

objects = [
    rect1 = {
        id: 1,
        x: 0,
        y: 0,
        r: 90
    }
]

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
                ctx.drawImage(gridDot, i - z / 12, j - z / 12, z / 6, z / 6)
            }
        }
    }
    if( z < 40 ) {
        ctx.fillStyle = "rgba(0,0,0," + Math.min(1, z / 20) + ")";
        for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) { //
            for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
                ctx.fillRect(i - z / 20, j - z / 20, z / 15, z / 15);
            }
        }
    }

    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.fillRect((-origin.x + rect1.x)* z, (origin.y - rect1.y) * z, z * 1, z * 1);

    //Smooth Zoom transistion
    if(settings.smoothZoom) {
        origin.x += mouse.screen.x * (1 / z - 5 / (smoothZoom + 4 * z));
        origin.y -= mouse.screen.y * (1 / z - 5 / (smoothZoom + 4 * z));
        z = z - (z - smoothZoom) / 5;
    } else {
        origin.x = (origin.x + mouse.screen.x * (1 / z - 1 / (smoothZoom)));
        origin.y = (origin.y - mouse.screen.y * (1 / z - 1 / (smoothZoom)));
        z = smoothZoom;
    }

    if(!lastFrame) {
        lastFrame = performance.now();
        fps = 0;
        return;
     }
     lastFrame = performance.now();
     fps = 1/((performance.now() - lastFrame)/1000);

    window.requestAnimationFrame(draw);
}

draw();

let delta = 0

canvas.onmousemove = function(e) {
    if (mouseDown && dragging === false) {
        origin.x = origin.prev.x + (origin.click.x - e.x)/z;
        origin.y = origin.prev.y - (origin.click.y - e.y)/z;
    }
}

canvas.onmousewheel = function(e) {
    e.preventDefault();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round((e.x / z + origin.x))  //) - 0.54)
    mouse.grid.y = Math.round((-e.y / z + origin.y))  //) + .54)
    smoothZoom = Math.min( Math.max(
        smoothZoom - z / 8 * ((e.deltaY) > 0 ? .3 : -.5),
            15),                                                    //minimum zoom
        300                                                         //maximum zoom
    );
    zoomPercentage.innerHTML = Math.round(z) + '%';              //level of current shown zoom on screen
    return false;
}

canvas.onmousedown = function(e) {
    e.preventDefault();
    mouseDown = true

    origin.click.x = e.x
    origin.click.y = e.y
    origin.prev.x = origin.x
    origin.prev.y = origin.y

    canvas.style.cursor = "grabbing"
}

canvas.onmouseup = function(e) {
    e.preventDefault();

    mouseDown = false;
    dragging = false;
    drawing = false;

    canvas.style.cursor = "crosshair"
}

zoomPercentage.innerHTML = Math.round(z) + '%';
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
