const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingQuality = 'low';
//const zoomLevel = document.getElementById("zoomlevel");
const dot = document.getElementById('source');

let z = 100;                                            // zoom
let smoothZoom = z;

let dragging = false;
let drawing = false;
let mouseDown = false;
let settings = {
    smoothZoom: true,                                   // enable/disable smooth zoom
}

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let origin = {                                          //set origin to center of screen
    x: - Math.round(canvas.width/(z*2)),
    y: Math.round(canvas.height/(z*2))
};

let mouse = {
    screen: { x: 0, y: 0 },
    grid: { x: 0, y: 0 },
    cell: {x: 0, y: 0}
};

console.log(Math.round(canvas.width/(z*2))) //16
console.log(Math.round(canvas.height/(z*2))) //11

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
    if( z > 50 ) {
        for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) { //
            for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
                ctx.drawImage(dot, i - z / 12, j - z / 12, z / 6, z / 6)
            }
        }
    }
    if( z < 50 ) {
        ctx.fillStyle = "rgba(150,150,150,1";
        for (let i = (-origin.x * z) % z; i < canvas.width; i+=z) { //
            for (let j = (origin.y * z) % z; j < canvas.height; j+=z) { 
                ctx.fillRect(i - z / 20, j - z / 20, z / 10, z / 10);
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

canvas.onmousewheel = function(e) {
    e.preventDefault();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round((e.x / z + origin.x))  //) - 0.54)
    mouse.grid.y = Math.round((-e.y / z + origin.y))  //) + .54)
    console.log(e)
    smoothZoom = Math.min( Math.max(
        smoothZoom - z / 8 * ((e.deltaY) > 0 ? .3 : -.5),
            15),                                                    //minimum zoom
        300                                                         //maximum zoom
    );
    //zoomLevel.innerHTML = Math.round(zoom) + '%'; //level of current shown zoom on screen

    return false;
}
