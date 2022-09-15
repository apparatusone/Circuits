import {
    Wire,
    TempLine,
    Node,
    Label,
    Led,
    OnOffSwitch,
    ConstantHigh,
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

import { within, drawShape, color, average, stringIncludes, buildComponent } from './utilities.js'

const menuCanvas = document.getElementById("menu-canvas");
const menu = menuCanvas.getContext("2d", { alpha: true });
menuCanvas.style.pointerEvents = 'none';
menu.imageSmoothingEnabled = true;
menu.imageSmoothingQuality = 'high';

menuCanvas.height = window.innerHeight;
menuCanvas.width = window.innerWidth;

const menuBackgroundLeft = document.getElementById("menu-background-left");
const menuHideLeft = document.getElementById("menu-hide-left");
const menuBackgroundRight = document.getElementById("menu-background-right");
const menuHideRight = document.getElementById("menu-hide-right");


scroll = {
    enable: false,
    y: 0
}

const menuObjects = {
    heading1: {y: 10, text: 'input / output'},

    switch: {obj: new OnOffSwitch, name: 'switch', type: 'shape'},
    led: {obj: new Led, name: 'led', type: 'shape'},
    clock: {obj: new Clock, name: 'clock', type: 'shape'},
    constant: {obj: new ConstantHigh, name: 'Constant-High', type: 'shape'},

    heading2: {y: 70, text: 'Miscellaneous'},

    label: {obj: new Label, name: 'label', type: 'shape'},

    heading3: {y: 70, text: 'Gates'},

    and: {obj: new AndGate, name: 'and', type: 'shape'},
    nand: {obj: new NandGate, name: 'nand', type: 'shape'},
    or: {obj: new OrGate, name: 'or', type: 'shape'},
    nor: {obj: new NorGate, name: 'nor', type: 'shape'},
    xor: {obj: new XorGate, name: 'xor', type: 'shape'},
    xnor: {obj: new XnorGate, name: 'xnor', type: 'shape'},
    not: {obj: new NotGate, name: 'not', type: 'shape'},

    heading4: {text: 'Custom Components'},

    cc: {obj: new CustomComponent, name: 'Full-Adder', type: 'svg'},
    cc2: {obj: new CustomComponent, name: 'sr-Flip-Flop', type: 'svg'},
    cc3: {obj: new CustomComponent, name: 'Multiplexer', type: 'svg'},
    // cc4: {obj: new CustomComponent, name: 'Plce-hldr3Pl-text-longtexttst', type: 'svg'},
    // cc5: {obj: new CustomComponent, name: 'Plcehldr3Pltext-longtexttst', type: 'svg'},
    // cc6: {obj: new CustomComponent, name: 'Plcdr4', type: 'svg'},
    // cc7: {obj: new CustomComponent, name: 'Plcdr5', type: 'svg'},
    // cc8: {obj: new CustomComponent, name: 'Plcdr6', type: 'svg'},
}

const x = [35, 165];
const y = [135, 0];
let i = 1;
let location = { x: 35, y: 20}
let bottomComponent;
//set location of headings, add headings
for (let [key, value] of Object.entries(menuObjects)) {
    if (stringIncludes ('heading',key)) {
        let offset = 0
        if (i === 0) offset = 130
        menuHeading(location.y + offset, value.text)
        location.y = location.y + offset + 40
        location.x = 35
        i = 1
        continue
    }

    value.x = location.x
    value.y = location.y

    location.x = x[i];
    location.y = location.y + y[i]
    bottomComponent = location.y

    i ^= 1
}

for (const [key, value] of Object.entries(menuObjects)) {
    //remove headings and dividers from object
    if (stringIncludes ('heading',key)) {
        delete menuObjects[key]
        continue
    }

    //draw menu item name under item
    let p = document.createElement("p")
    let name;

    // modify name if too long
    if (value.name.length > 25) {
        name = value.name.slice(0,25) + '...';
        
        console.log(name);
        
    } else {
        name = value.name
    }

    // add component labels
    p.setAttribute('id', `${value.name.toLowerCase()}-text`);
    p.textContent = `${name.toUpperCase().replace(/(-)/g,' ')}`
    p.style.fontFamily = "Arial, Helvetica, sans-serif"
    p.style.fontSize = `${Math.max(12,Math.min(15,150/name.length))}px`
    p.style.position = "fixed"
    p.style.color = "white"
    p.style.width = "110px";
    p.style.textAlign = "center"
    p.style.marginLeft = `${value.x-5}px`
    p.style.marginTop = `${value.y + 105}px`
    p.style.pointerEvents = "none";
    menuBackgroundLeft.append(p)

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
    menuBackgroundLeft.append(box)
}

function menuHeading(y,text) {
    // menu headings
    const heading = document.createElement("h2")
    heading.classList.add('menu-heading')
    heading.textContent = text;
    heading.style.fontFamily = "Arial, Helvetica, sans-serif"
    heading.style.fontSize = "20px"
    heading.style.position = "fixed"
    heading.style.color = "white"
    heading.style.width = "250px";
    heading.style.textAlign = "left"
    heading.style.marginLeft = '35px'
    heading.style.setProperty('--offset', y);
    heading.style.marginTop = `${y}px`
    heading.style.pointerEvents = "none";
    menuBackgroundLeft.append(heading)

    //menu dividers
    const divider = document.createElement("div")
    divider.classList.add('menu-heading')
    divider.style.position = "fixed"
    divider.style.backgroundColor = "rgba(255, 255, 255, 0.276)"
    divider.style.width = "280px";
    divider.style.height = "1px"
    divider.style.marginLeft = '10px'
    divider.style.setProperty('--offset', y+24);
    divider.style.marginTop = `${y+24}px`
    divider.style.pointerEvents = "none";
    menuBackgroundLeft.append(divider)
}

// temp object dragged into main canvas
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
            menu.drawImage(ghostObject[0].obj.image, ghostObject[0].x, ghostObject[0].y, z, z);
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
            menu.lineWidth = z/30;
            drawShape.circle(a , b, 5.5, '#black', true, 'white', true, menu)
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

// list of delta values to average for smooth scrolling
let deltaYArray = [0]
window.onmousewheel = function(e) {
    if(!scroll.enable) return

    fpsInterval = 1000 / 60;

    //set bounds of scroll
    let topBound = 0
    let botttomBound = -1*bottomComponent + window.innerHeight - 150

    // get average of last 5 e.deltaY values
    scroll.y =  Math.max(Math.min(scroll.y,topBound),botttomBound) + Math.round(average(deltaYArray))
    //scroll.y+=e.deltaY

    if (deltaYArray.length > 8) {
        deltaYArray.pop()
        deltaYArray.unshift(-1*e.deltaY)
    } else {
        deltaYArray.unshift(-1*e.deltaY)
    }

    const headings = document.querySelectorAll('.menu-heading')
    headings.forEach(function(heading){
        const offset = getComputedStyle(heading).getPropertyValue('--offset');
        heading.style.marginTop = `${scroll.y + parseInt(offset)}px`
      })
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
        let start = performance.now()
        let end;
        if (clickedObject.obj.constructor === CustomComponent) {
            let string = (clickedObject.name.replace(/(-)/g,''))
            let name = string.charAt(0).toLowerCase() + string.slice(1)
            let id = buildComponent(make[name])
            end = performance.now()
            objects[id].x = Math.round(mouse.canvas.x*2)/2;
            objects[id].y = Math.round(mouse.canvas.y*2)/2;
        } else {
            make[clickedObject.name.replace('-','')](Math.round(mouse.canvas.x*2)/2,Math.round(mouse.canvas.y*2)/2,0)
        }


        // remove menu highlight
        const element = document.getElementById(`${clickedObject.name.toLowerCase()}-box`);
        element.classList.remove("menu-item-highlight");
        element.classList.add("menu-item-unhighlight");
        ghostObject.pop()

        create = false

        console.log(end - start);
        
    }

    clickedObject = undefined
    // delay and set fps to 1
    setTimeout(() => {
        fpsInterval = 1000 / 1;
      }, "500")
}

menuBackgroundLeft.onmouseover = function() {
    menuCanvas.classList.remove("unselectable");
    create = true;
    scroll.enable = true;
};

menuBackgroundLeft.onmouseleave = function() {
    menuCanvas.classList.add("unselectable");

    setTimeout(() => {
        scroll.enable = false;
      }, "200")
};

// button to hide menu
menuHideLeft.onclick = function() {
    if (getComputedStyle(menuHideLeft).getPropertyValue('left') === "300px") {
        menuBackgroundLeft.style.left = "-300px";
        menuCanvas.style.left = "-300px";
        menuHideLeft.style.left = "0";
        menuHideLeft.textContent = ">";
        setTimeout(() => {
            stop = true
          }, "500")
    }

    if (getComputedStyle(menuHideLeft).getPropertyValue('left') === "0px") {
        stop = false
        menuBackgroundLeft.style.left = "0px";
        menuCanvas.style.left = "0px";
        menuHideLeft.style.left = "300px";
        menuHideLeft.textContent = "<";
    }
};

// menuHideRight.onclick = function() {
//     if (getComputedStyle(menuHideRight).getPropertyValue('right') === "300px") {
//         menuBackgroundRight.style.right = "-300px";
//         menuCanvas.style.right = "-300px";
//         menuHideRight.style.right = "0";
//         menuHideRight.textContent = "<";
//     }

//     if (getComputedStyle(menuHideRight).getPropertyValue('right') === "0px") {
//         menuBackgroundRight.style.right = "0px";
//         menuCanvas.style.right = "0px";
//         menuHideRight.style.right = "300px";
//         menuHideRight.textContent = ">";
//     }
// };
