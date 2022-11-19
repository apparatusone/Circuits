"use strict";

import { Wire, make, Led, OnOffSwitch, CustomComponent, Node } from "./parts.js"

// return true if string 'a' is anywhere in string 'b'
export function stringIncludes (a,b) {
    const regex = new RegExp( a, 'gi' );
    return regex.test(b)
}

// return boolean for a point within a shape 
export const within = (function() {

    // is point (a,b) within rectanlge at (x,y) with width 'w' and height 'h'
    const rectangle = function (x, y, w, h, a, b) {
        if(a > x && a < x + w && b > y && b < y + h) {
            return true;
        }
        return false;
    }

    // is point (a,b) within circle at (x,y) with radius 'r'
    const circle = function (x, y, r, a, b) {
        const distSqr = Math.pow(x - a, 2) + Math.pow(y - b, 2);
    
        if (distSqr < r * r) {
            return true;
        }
        return false;
    }
    return {
        rectangle: rectangle,
        circle: circle,
    }

})();

//TODO: move to shapes.js
export const drawShape = (function() {

    const circle = function (x,y,r,colorStroke,stroke,colorFill,fill,context) {
        context.setLineDash([]);
        context.strokeStyle = colorStroke;
        context.fillStyle = colorFill;
    
        context.beginPath();
        context.arc((-origin.x + x + 0.5) * z, (origin.y - y + 0.5) * z, r/100*z, 0, 2 * Math.PI);
        if ( stroke ) context.stroke();
        if ( fill ) context.fill();
    }

    return {
        circle: circle,
    }
    
})();

// function to generate unique id for components
window.iterate = 1
export const idCreator = function* () {
    while (true) yield iterate++;
};
const idsGenerator = idCreator();
export const generateId = () => idsGenerator.next().value;

// get minimum and maximum of array
export const minMax = function (items) {
    const map1 = items.map(ele => ele);

    return map1.reduce((acc, val) => {
        acc[0] = ( acc[0] === undefined || val < acc[0] ) ? val : acc[0]
        acc[1] = ( acc[1] === undefined || val > acc[1] ) ? val : acc[1]
        return acc;
    }, []);
}

// return slope of line between points 'a' and 'b'
export const slope = function (a,b)
{
    if (b.x - a.x != 0)
    {
        return (b.y - a.y) / (b.x - a.x);
    }
    return Number.MAX_VALUE;
}

// Capitalize first letter of a string
export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

var _cls_ = {}; // serves as a cache, speed up later lookups
export function getClass(name){
  if (!_cls_[name]) {
    // cache is not ready, fill it up
    if (name.match(/^[a-zA-Z0-9_]+$/)) {
      // proceed only if the name is a single word string
      _cls_[name] = eval(name);
    } else {
      // arbitrary code is detected 
      throw new Error("?");
    }
  }
  return _cls_[name];
}

//colors
export const color = (function() {
    const root = document.documentElement;

    let background, line, lineHigh, lineLow, object, grid, menu, icon, tooltip, rotate, windowBox;

    function update() {
        this.background = (settings.darkMode) ? "rgba(15,15,15,1)":"#ECF0F3";
        this.line = (settings.darkMode) ? "white":"black";
        this.lineHigh = (settings.darkMode) ? "white":"black";
        this.lineLow = (settings.darkMode) ? "#9E9E9E":"#737373";
        this.object = (settings.darkMode) ? "#222222":"white";
        this.grid = (settings.darkMode) ? "rgba(255,255,255,.1)":"rgba(150,150,150,.3)";
        this.menu = (settings.darkMode) ? "rgba(255, 255, 255, 0.5)":"rgba(0, 7, 21, 0.738)";
        this.sideMenu = (settings.darkMode) ? "rgba(170, 170, 170, 0.6)":"rgba(0, 7, 21, 0.5)";
        this.icon = (settings.darkMode) ? "black":"white";
        this.tooltip = (settings.darkMode) ? "white":"black";
        this.rotate = (settings.darkMode) ? "white":"rgba(0, 7, 21, 0.7)";
        this.windowBox = (settings.darkMode) ? "rgba(170, 170, 170, 0.6)":"#000000ba";
    
        root.style.setProperty('--menu-color', this.menu);
        root.style.setProperty('--side-menu-color', this.sideMenu);
        root.style.setProperty('--text-color', this.icon);
        root.style.setProperty('--tooltip-color', this.tooltip);
        root.style.setProperty('--window-color', this.windowBox);
    
        const self = this
        // update color of top menu icons
        const icons = document.querySelectorAll('.post-icon')
        icons.forEach(function(icon){
        icon.setAttribute('fill', self.icon);
        })

        // update color of rotate buttons
        const rotate = document.querySelectorAll('.rotate')
        rotate.forEach(function(icon){
            icon.setAttribute('fill', self.rotate);
            })
    }

    return {
        update: update,

        background: background,
        line: line,
        lineHigh, lineHigh,
        lineLow, lineLow,
        object: object,
        grid: grid,
        menu: menu,
        icon: icon,
        tooltip: tooltip,
        rotate: rotate
    }
})();

export const radians = function (degree) {
    return degree * (Math.PI / 180)
}

export function average(array) {
    const sum = array.reduce((a, b) => a + b, 0);
    return (sum / array.length) || 0;
}

export function buildComponent(custom) {
    let parsed = {}

    const regex1 = /(id":"|id":|wireId":"|wireId":)(\d+)/
    const regexId = new RegExp(regex1,"gm");

    const regex2 = /(?!.*list)(\d+)(?=")(?=.*\],"wires")/
    const regexList = new RegExp(regex2,"gm");

    const regex3 = `(},"|},)\d+(":{"nodeState"|:{"nodeState")`
    const wireKey = new RegExp(regex3,"gm");

    // increment all id's and key's by current iterate
    let incrementedCustom = {}
    for (let [key, json] of Object.entries(custom)) {
        let id = parseInt(key) + parseInt(iterate) - 1
        incrementedCustom[id] = json.replace(regexId, idReplacer)
        incrementedCustom[id] = incrementedCustom[id].replace(regexList, replacer)
        incrementedCustom[id] = incrementedCustom[id].replace(wireKey, replacer)
    }

    function replacer(match, p1, p2, p3, offset, string) {
        if (match === 'd') return 'd'
        return (parseInt(match) + parseInt(iterate) - 1) 
    }

    function idReplacer(match, p1, p2, p3, offset, string) {
        return p1+(parseInt(p2) + parseInt(iterate) - 1) 
    }

    for (const [key, string] of Object.entries(incrementedCustom)) {
        parsed[key] = JSON.parse(string)
    }

    let range = {x:[],y:[],id:[]}
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
                newNode.connectionType = wires
                newNode.id = parseInt(newNode.id)
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

        if (object.type !== 'wire') { 
            range.id.push(id)
        }
    }

    //filter range of components inside custom components
    const filtered = range.id.filter(id => (objects[id] !== undefined));
    for (const id of filtered) {
        range.x.push(objects[id].x)
        range.y.push(objects[id].y)
    }

    // set coordinates
    for (const id of filtered) {
        if (objects[id] === undefined) continue

        if (filtered.length === 1) {
            objects[id].x = Math.round(mouse.canvas.x*2)/2;
            objects[id].y = Math.round(mouse.canvas.y*2)/2;
            break
        }
        objects[id].highlight = true
        objects[id].x = Math.round((objects[id].x - average(minMax(range.x)) + parseFloat(mouse.canvas.x))*2)/2;
        objects[id].y = Math.round((objects[id].y - average(minMax(range.y)) + parseFloat(mouse.canvas.y))*2)/2; 
    }

    if (Object.keys(parsed).length < 1 ) return
    const id = Object.keys(parsed).reduce((a, b) => parsed[a] > parsed[b] ? a : b);
    iterate = parseInt(id) + 1;
    return id;
}

export function makeCustomComponent(parts, id) {
    // check if SWITCHES and LED's have names
    for (const part of parts) {
        if (part.constructor === Led || part.constructor === OnOffSwitch) {
            if (part.name === 'undefined') {
                alert('Not all i/o has been named')
                return
            }
        }
    }

    // check if names are unique
    let map = {}
    for (const part of parts) {
        if (part.constructor === Led || part.constructor === OnOffSwitch) {
            if (map[part.name] !== undefined) {
                alert('Names must be unique')
                return
            }
            map[part.name] = 0;
    }

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

    //TODO:
    //get center of parts for cc x and y

    return component
}

// id of component, boolean for resetting component states/connections
export function deleteComponent(id,reset) {
    for (let node of objects[id].nodes) {
        deleteWire(objects[id][node].wireId,reset)
    }
    //rotateButtons('hide')
    delete objects[id]
}

export function deleteWire(id,reset) {
    if (!wires[id]) return

    for (let node of wires[id].nodes) {
        deleteWire(node.wireId,reset)
    }

    let node = {
        a: wires[id].node.a,
        b: wires[id].node.b,
    }

    if (reset) {
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

export function addMdi(mdi, domObject, color, viewBox, scale, cssClass) {
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

export function pointOnLine (p1,p2,x,y,radius) {
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

export function mouseClickDuration(start, end, time) {
    if ((end - start) < time) {
        return true
    }
}

// TODO: replace
export function formatBytes(a,b=2){if(!+a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return`${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}`}

export const delay = ms => new Promise(res => setTimeout(res, ms));

export function easeInOutCirc(x) {
    return x < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }

export function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

export function easeInExpo(x) {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

// get div location
export function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
    };
}

// clear highlight on specified components
export function clearHighlight( type ) {

    if (type === 'wires' || type === 'all') {
        Object.values(wires).forEach( wire => wire.highlight = false)
        if (type === 'wires') return
    }

    if (type === 'objects' || type === 'all') {
        Object.values(objects).forEach( object => object.highlight = false)
    }

    if (type === 'nodes' || type === 'all') {
        for (let [key, wire] of Object.entries(wires)) {
            for (const node of wire.nodes) {
                node.highlight = false;
            }
        }
    }
}
    
