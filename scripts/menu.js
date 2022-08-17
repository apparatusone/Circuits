const menuCanvas = document.getElementById("menu-canvas");
const menu = menuCanvas.getContext("2d", { alpha: true });
menu.imageSmoothingEnabled = true;
menu.imageSmoothingQuality = 'high';

menuCanvas.height = window.innerHeight;
menuCanvas.width = window.innerWidth;

const menuBackground = document.getElementById("menu-background");
const menuClose = document.getElementById("menu-close");

const menuObjects = {
    led: {x: 50, y: 100, obj: ledMenu, name: 'Led', type: 'shape'},
    switch: {x: 150, y:100, obj: switchMenu, name: 'OnOffSwitch', type: 'shape'},
    and: {x: 50, y: 240, obj: andGate, name: 'And', type: 'svg'},
    nand: {x: 150, y: 240, obj: nandGate, name: 'Nand', type: 'svg'},
    or: {x: 50, y: 380, obj: orGate, name: 'Or', type: 'svg'},
    nor: {x: 150, y: 380, obj: norGate, name: 'Nor', type: 'svg'},
    xor: {x: 50, y: 520, obj: xorGate, name: 'Xor', type: 'svg'},
    xnor: {x: 150, y: 520, obj: xnorGate, name: 'Xnor', type: 'svg'},
    not: {x: 50, y: 660, obj: notGate, name: 'Not', type: 'svg'},
    clock: {x: 150, y: 660, obj: clockMenu, name: 'Clock', type: 'shape'},
}

const ghostObject = []
let clickedObject;


let fpsInterval, startTime, now, then, elapsed;
let stop = false
startAnimating();
function startAnimating() {
    fpsInterval = 1000 / 60;
    then = window.performance.now();
    startTime = then;
    menuDraw();
    setTimeout(() => {
        fpsInterval = 1000 / 1;
      }, "500")
}

function menuDraw(newtime) {
        requestAnimationFrame(menuDraw);

        if (stop) {
            menu.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
            return
        }
    
        // calc elapsed time since last loop
        now = newtime;
        elapsed = now - then;
    
        // if enough time has elapsed, draw the next frame
        if (elapsed > fpsInterval) {
            // Get ready for next frame by setting then=now, but...
            // Also, adjust for fpsInterval not being multiple of 16.67
            then = now - (elapsed % fpsInterval);

    menu.clearRect(0, 0, menuCanvas.width, menuCanvas.height);

    for (const [key, value] of Object.entries(menuObjects)) {
        if (value.type === 'svg') {
            menu.drawImage(value.obj,value.x,value.y,100,100)
        }
        if (value.type === 'shape') {
            menu.fillStyle = "#fff";
            value.obj(value.x/100, value.y/100, 0,0, 100)
        }
    }

    if (ghostObject.length === 1) {
        if (ghostObject[0].type === 'svg') {
            menu.drawImage(ghostObject[0].obj, ghostObject[0].x, ghostObject[0].y, z, z);
        }
        if (ghostObject[0].type === 'shape') {
            menu.fillStyle = "#fff";
            ghostObject[0].obj(ghostObject[0].x/z, ghostObject[0].y/z, 0,0, z)
        }
    }

    }
}


let create = false
window.onmousemove = function(e) {
    if (create && ghostObject.length) {
        ghostObject[0].x = e.x - (.5 * z)
        ghostObject[0].y = e.y - (.5 * z)
    };
}

window.onmousewheel = function(e) {
    e.preventDefault();
    if (create) {
        ghostObject[0].x = e.x - (.5 * z)
        ghostObject[0].y = e.y - (.5 * z)
    };
}

window.onmousedown = function(e) {
    fpsInterval = 1000 / 60;
    if (create) {

        for (let [key, value] of Object.entries(menuObjects)) {
            if (isCursorWithinRectangle(value.x, value.y, 100, 100, e.x, e.y)) {
                clickedObject = value;
            }
            value.highlight = false;
        }

        // if no object under cursor return
        if (!clickedObject) return

        // create shallow copy
        let copy = Object.assign({}, clickedObject);
        ghostObject.push(copy)
    }
}

window.onmouseup = function(e) {
    if (create && clickedObject) {
        window[`make${clickedObject.name}`](Math.round(mouse.canvas.x*2)/2,Math.round(mouse.canvas.y*2)/2,0)

        ghostObject.pop()
        create = false
    }

    clickedObject = undefined
    // set fps to 1
    setTimeout(() => {
        fpsInterval = 1000 / 1;
      }, "500")
}

menuBackground.onmouseover = function() {
    menuCanvas.classList.remove("unselectable");
    create = true;
};

menuBackground.onmouseout = function() {
    menuCanvas.classList.add("unselectable");
};

menuClose.onclick = function() {
    if (getComputedStyle(menuClose).getPropertyValue('left') === "300px") {
        menuBackground.style.left = "-300px";
        menuCanvas.style.left = "-300px";
        menuClose.style.left = "0";
        menuClose.textContent = ">";
        setTimeout(() => {
            stop = true
          }, "500")
    }

    if (getComputedStyle(menuClose).getPropertyValue('left') === "0px") {
        stop = false
        menuBackground.style.left = "0px";
        menuCanvas.style.left = "0px";
        menuClose.style.left = "300px";
        menuClose.textContent = "<";
    }
};


// paths
function ledMenu (x1, y1, a, b, z) {
    menu.strokeStyle = 'rgba(0,0,0,1)';
    menu.lineWidth = z/15;
    menu.setLineDash([]);

    menu.beginPath();
    menu.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .10 * z, 0, 1 * Math.PI, true);
    menu.lineTo((-a+ x1 + 0.4) * z, (b + y1 + .75) * z);
    menu.lineTo((-a + x1 + 0.6) * z, (b + y1 + .75) * z);
    menu.lineTo((-a + x1 + 0.6) * z, (b + y1 + 0.5) * z);
    menu.stroke();
    menu.fill();

    menu.lineWidth = z/25;
    menu.lineCap = 'butt';
    menu.beginPath();
    menu.lineTo((-a + x1 + 0.5) * z, (b + y1 + .75) * z);
    menu.lineTo((-a + x1 + 0.5) * z, (b + y1 + 1) * z);
    menu.stroke();
}

function switchMenu (x, y, a, b, z) {
    menu.strokeStyle = 'rgba(0,0,0,1)';
    menu.lineWidth = z/15;
    menu.setLineDash([]);

    const top = (b + y + .2) * z;
    const left = (-a + x + .3) * z;
    const width = .4*z;
    const height = .6*z;
    const radius = .075*z;
    
    menu.beginPath();
    menu.moveTo(left + radius, top);
    menu.lineTo(left + width - radius, top);
    menu.arcTo(left + width, top, left + width, top + radius, radius);
    menu.lineTo(left + width, top + height - radius);
    menu.arcTo(left + width, top + height, left + width - radius, top + height, radius);
    menu.lineTo(left + radius, top + height);
    menu.arcTo(left, top + height, left, top + height - radius, radius);
    menu.lineTo(left, top + radius);
    menu.arcTo(left, top, left + radius, top, radius);
    menu.stroke();
    menu.fill()

    menu.lineWidth = z/25;
    menu.beginPath();
    menu.lineTo((-a + x + 0.5) * z, (b + y + .3) * z);
    menu.lineTo((-a + x + 0.5) * z, (b + y + .4) * z);
    menu.stroke();
    
    menu.beginPath();
    menu.arc((-a + x + 0.5)* z, (b + y + 0.65) * z, .06*z, 0, 2 * Math.PI);
    menu.stroke();

    menu.lineCap = 'butt';
    menu.beginPath();
    menu.lineTo((-a + x + 0.5) * z, (b + y + 0) * z);
    menu.lineTo((-a + x + 0.5) * z, (b + y + .2) * z);
    menu.stroke();
}

function clockMenu (x1, y1, a, b, z) {
    menu.strokeStyle = 'rgba(0,0,0,1)';
    menu.lineWidth = z/15;
    menu.setLineDash([]);

    menu.beginPath();
    menu.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .25 * z, 0, 2 * Math.PI, true);
    menu.stroke();
    menu.fill();

    menu.lineWidth = z/25;
    menu.lineCap = 'butt';
    menu.beginPath();
    menu.lineTo((-a + x1 + 0.75) * z, (b + y1 + 0.5) * z);
    menu.lineTo((-a + x1 + 1.0) * z, (b + y1 + 0.5) * z);
    menu.stroke();

    menu.lineWidth = z/40;
    menu.beginPath();
    menu.lineTo((-a + x1 + 0.38) * z, (b + y1 + 0.6) * z);
    menu.lineTo((-a + x1 + 0.38) * z, (b + y1 + 0.41) * z);
    menu.lineTo((-a + x1 + 0.46) * z, (b + y1 + 0.41) * z);
    menu.lineTo((-a + x1 + 0.46) * z, (b + y1 + 0.59) * z);
    menu.lineTo((-a + x1 + 0.54) * z, (b + y1 + 0.59) * z);
    menu.lineTo((-a + x1 + 0.54) * z, (b + y1 + 0.41) * z);
    menu.lineTo((-a + x1 + 0.62) * z, (b + y1 + 0.41) * z);
    menu.lineTo((-a + x1 + 0.62) * z, (b + y1 + 0.6) * z);
    menu.stroke();
}