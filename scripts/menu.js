import {
    Wire,
    TempLine,
    Node,
    Label,
    Led,
    OnOffSwitch,
    Clock,
    AndGate,
    NandGate,
    OrGate,
    NorGate,
    XorGate,
    XnorGate,
    NotGate,
    CustomComponent,
    make,
} from "./parts.js"

import { within, drawShape, color, average } from './utilities.js'

const menuCanvas = document.getElementById("menu-canvas");
const menu = menuCanvas.getContext("2d", { alpha: true });
menuCanvas.style.pointerEvents = 'none';
menu.imageSmoothingEnabled = true;
menu.imageSmoothingQuality = 'high';

menuCanvas.height = window.innerHeight;
menuCanvas.width = window.innerWidth;

const menuBackground = document.getElementById("menu-background");
const menuHide = document.getElementById("menu-hide");

scroll = {
    enable: false,
    y: 0
}

const menuObjects = {
    label: {obj: new Label, name: 'Label', type: 'shape'},
    led: {obj: new Led, name: 'Led', type: 'shape'},
    switch: {x: 165, y:100, obj: new OnOffSwitch, name: 'Switch', type: 'shape'},
    and: {x: 35, y: 235, obj: new AndGate, name: 'And', type: 'shape'},
    nand: {x: 165, y: 235, obj: new NandGate, name: 'Nand', type: 'shape'},
    or: {x: 35, y: 370, obj: new OrGate, name: 'Or', type: 'shape'},
    nor: {x: 165, y: 370, obj: new NorGate, name: 'Nor', type: 'shape'},
    xor: {x: 35, y: 505, obj: new XorGate, name: 'Xor', type: 'shape'},
    xnor: {x: 165, y: 505, obj: new XnorGate, name: 'Xnor', type: 'shape'},
    not: {x: 35, y: 640, obj: new NotGate, name: 'Not', type: 'shape'},
    clock: {x: 165, y: 640, obj: new Clock, name: 'Clock', type: 'shape'},
    cc: {x: 35, y: 775, obj: new CustomComponent, name: 'Plcehldr1', type: 'svg'},
    cc2: {x: 35, y: 910, obj: new CustomComponent, name: 'Plcehldr2', type: 'svg'},
    cc3: {x: 35, y: 1045, obj: new CustomComponent, name: 'Plcehldr3', type: 'svg'},
}

const x = [35, 165];
const y = [135, 0];
let i = 1;
let location = { x: 35, y: 100}
for (let [key, value] of Object.entries(menuObjects)) {
    value.x = location.x
    value.y = location.y

    location.x = x[i];
    location.y = location.y + y[i]

    i ^= 1
}

for (const [key, value] of Object.entries(menuObjects)) {
    //draw menu item name under item
    let p = document.createElement("p")
    p.setAttribute('id', `${value.name.toLowerCase()}-text`);
    p.textContent = `${value.name.toUpperCase()}`
    p.style.fontFamily = "Arial, Helvetica, sans-serif"
    p.style.position = "fixed"
    p.style.color = "white"
    p.style.width = "100px";
    p.style.textAlign = "center"
    p.style.marginLeft = `${value.x}px`
    p.style.marginTop = `${value.y + 105}px`
    p.style.pointerEvents = "none";
    menuBackground.append(p)

    // draw box around menu item
    let box = document.createElement("div")
    box.setAttribute('id', `${value.name.toLowerCase()}-box`);
    box.style.position = "fixed"
    box.style.width = "100px"
    box.style.height = "100px"
    box.classList.add("menu-item-unhighlight")
    box.style.marginLeft = `${value.x - 2}px`
    box.style.marginTop = `${value.y - 2}px`
    box.style.pointerEvents = "none";
    menuBackground.append(box)
}

const ghostObject = []
export let clickedObject;

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

    // draw components
    for (const [key, value] of Object.entries(menuObjects)) {
        if (value.type === 'svg') {
            menu.drawImage(value.obj.image,value.x, scroll.y + value.y,100,100)   
        }
        if (value.type === 'shape') {
            menu.fillStyle = color.object;
            menu.strokeStyle = color.line;
            menu.lineWidth = 7;
            value.obj.shape(value.x/100, (scroll.y + value.y)/100, 0, 0, 100, value.obj.w, value.obj.h, menu, value.obj)
        }
        //draw nodes
        for (const [key, node] of Object.entries(value.obj.offset)) {
            let a = value.x + node.x*100 + 50
            let b = scroll.y + value.y - node.y*100 + 50
            
            menu.strokeStyle = 'rgba(0,0,0,1)';
            menu.fillStyle = '#FFFFFF';
            menu.lineWidth = 3;
            menu.beginPath();
            menu.arc(a, b , 6, 0, 2 * Math.PI);
            menu.stroke();
            menu.fill();
        }
    }

    // update positions of text and boxes
    for (const [key, value] of Object.entries(menuObjects)) {
        const menuItemBox = document.querySelector(`#${value.name.toLowerCase()}-box`)
        const menuItemText = document.querySelector(`#${value.name.toLowerCase()}-text`)
        menuItemBox.style.marginTop = `${scroll.y + value.y - 2}px`
        menuItemText.style.marginTop = `${scroll.y + value.y + 105}px`
    }

    //draw object being dragged
    if (ghostObject.length === 1) {
        if (ghostObject[0].type === 'svg') {
            menu.drawImage(ghostObject[0].obj.image, ghostObject[0].x, scroll.y + ghostObject[0].y, z, z);
        }
        if (ghostObject[0].type === 'shape') {
            menu.fillStyle = color.object;
            menu.strokeStyle = color.line;
            menu.lineWidth = z/15;
            ghostObject[0].obj.shape(ghostObject[0].x/z, ghostObject[0].y/z, 0,0, z, ghostObject[0].obj.w, ghostObject[0].obj.h, menu, ghostObject[0].obj)
        }
        for (const [key, node] of Object.entries(ghostObject[0].obj.offset)) {
            let a = ghostObject[0].x/z + origin.x + node.x
            let b = -ghostObject[0].y/z + origin.y + node.y
            menu.strokeStyle = 'rgba(0,0,0,1)';
            menu.lineWidth = z/30;
            drawShape.circle(a , b, .055, menu)
            menu.fill();
        }
    }

    //transparency at top and bottom of menu
    menu.globalCompositeOperation = 'destination-out';
    let grd = menu.createLinearGradient(150, 0, 150, window.innerHeight);
    grd.addColorStop(0, "black");
    grd.addColorStop(.05, "transparent");
    grd.addColorStop(.95, "transparent");
    grd.addColorStop(1, "black");
    menu.rect(0,0,300,window.innerHeight)
    menu.fillStyle = grd;
    menu.fill()
    menu.fill()
    menu.fill()
    menu.globalCompositeOperation = 'source-over';

    }
}


let create = false
window.onmousemove = function(e) {

    if (create && ghostObject.length) {
        ghostObject[0].x = e.x - (.5 * z)
        ghostObject[0].y = e.y - (.5 * z)
    };
}

let deltaYArray = [0]
window.onmousewheel = function(e) {
    if(!scroll.enable) return

    fpsInterval = 1000 / 60;

    let bottomComponent = 1045
    let min = -1*bottomComponent + 900

    // get average of last 5 e.deltaY values
    scroll.y =  Math.max(Math.min(scroll.y,0),min) + Math.round(average(deltaYArray))
    //scroll.y =  Math.max(Math.min(scroll.y,0),min) + e.delta

    if (deltaYArray.length > 8) {
        deltaYArray.pop()
        deltaYArray.unshift(-1*e.deltaY)
    } else {
        deltaYArray.unshift(-1*e.deltaY)
    }
}

window.onmousedown = function(e) {
    fpsInterval = 1000 / 60;
    if (create) {

        for (let [key, value] of Object.entries(menuObjects)) {
            if (within.rectangle(value.x, scroll.y + value.y, 100, 100, e.x, e.y)) {
                clickedObject = value;
            }
        }

        // if no object under cursor return
        if (!clickedObject) return

        // create shallow copy
        let copy = Object.assign({}, clickedObject);
        ghostObject.push(copy)

        //highlight dragged component in menu
        const element = document.getElementById(`${clickedObject.name.toLowerCase()}-box`);
        element.classList.remove("menu-item-unhighlight");
        element.classList.add("menu-item-highlight");
    }
}

window.onmouseup = function(e) {
    if (create && clickedObject) {
        make[clickedObject.name.toLowerCase()](Math.round(mouse.canvas.x*2)/2,Math.round(mouse.canvas.y*2)/2,0)

        // remove menu highlight
        const element = document.getElementById(`${clickedObject.name.toLowerCase()}-box`);
        element.classList.remove("menu-item-highlight");
        element.classList.add("menu-item-unhighlight");
        ghostObject.pop()

        create = false
    }

    clickedObject = undefined
    // delay and set fps to 1
    setTimeout(() => {
        fpsInterval = 1000 / 1;
      }, "500")
}


menuBackground.onmouseover = function() {
    menuCanvas.classList.remove("unselectable");
    create = true;
    scroll.enable = true;
};

menuBackground.onmouseleave = function() {
    menuCanvas.classList.add("unselectable");

    setTimeout(() => {
        scroll.enable = false;
      }, "200")
};

// button to hide menu
menuHide.onclick = function() {
    if (getComputedStyle(menuHide).getPropertyValue('left') === "300px") {
        menuBackground.style.left = "-300px";
        menuCanvas.style.left = "-300px";
        menuHide.style.left = "0";
        menuHide.textContent = ">";
        setTimeout(() => {
            stop = true
          }, "500")
    }

    if (getComputedStyle(menuHide).getPropertyValue('left') === "0px") {
        stop = false
        menuBackground.style.left = "0px";
        menuCanvas.style.left = "0px";
        menuHide.style.left = "300px";
        menuHide.textContent = "<";
    }
};
