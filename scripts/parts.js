'use strict';

import { generateId } from './utilities.js'
import { shape } from './shapes.js'
import { defineNodes, objects, wires, z, origin } from './main.js'

class Wire {
    constructor(node) {
        this.node = node

        this.id = generateId();
        this.nodes = [];

        // connect directly or along grid
        this.direct = true             
    }

    get loc() {
        return { 
            a: { x: this.node.a.x , y: this.node.a.y },
            b: { x: this.node.b.x , y: this.node.b.y },
        }
    }

    //reduced(array) { return array.reduce((partialSum, a) => partialSum + a, 0); }

    nodeState = { a: 0, b: 0}

    get state () {
        let state = 0;

        //update nodes on state change
        if (this.node.a.state !== this.nodeState.a) {
            if (this.node.a.state === undefined) {
                this.node.a.state = 0
            }
            state = this.node.a.state
            console.log('a',state)
        }

        if(this.node.b.state !== this.nodeState.b) {
            if (this.node.b.state === undefined) {
                this.node.b.state = 0
            }
            state = this.node.b.state
            console.log('b',state)
        }

        this.node.a.state = state;
        this.node.b.state = state;
        this.nodeState.a = state
        this.nodeState.b = state

        for (let n of this.nodes) {
            n.setter = state
        }
        return state;
    }
}

class TempLine {
    constructor(node) {
        this.node = node;
        this.x2;
        this.y2;
    }

    get x1 () { return this.node.x }
    get y1 () { return this.node.y }
}

class Node {
    constructor(id,connectionType,name) {
        this.name = name;
        this.connectionType = connectionType
        this.type = 'node'
        this.id = id;
        this.wireId;
        this.state = 0
        this.highlight = false;
        this.connected = false;

        this.classname = this.constructor.name;
    }

    set setter(state) {
        this.state = state
        if (this.wireId) wires[this.wireId].state
    }

    get x () { return this.connectionType[this.id].x + this.connectionType[this.id].offset[this.name].x };
    get y () { return this.connectionType[this.id].y + this.connectionType[this.id].offset[this.name].y };

    serialize(){
        return JSON.stringify(this);
    }
}

class Generic {
    constructor(x,y,r,id) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.id = id;

        this.w = 0.5;
        this.h = 0.6;
        this.name = 'undefined'
        this.highlight = false;
        //location of the nodes relative to the center of the cell
        this.offset =  {
            input1: { x: -0.25, y: -0.5 },
            input2: { x: 0.25, y: -0.5 },
            output: { x: 0, y: 0.5 },
        }

        this.classname = this.constructor.name;
    }

    //type = 'non-interactive'
    img = 'svg'

    temp = 0;

    get state () {
        if (this.temp !== this.logic()) {
            let state = this.logic();
            this.temp = state;
            this.output.setter = state
            return state
        }
    }

    get gridCoordinates () {
        return { x: (-origin.x + this.x) * z, y: (origin.y - this.y) * z }
    }

    rotateNodes(dir) {
        for (let ele in this.offset) {
            let a = this.offset[ele].x
            let b = this.offset[ele].y
            if (dir === 'right') [a, b] = [-b, a];
            if (dir === 'left') [a, b] = [b, -a];
            this.offset[ele].x = a
            this.offset[ele].y = b
        }
    }
}

class Led extends Generic{
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.w = 0.4
        this.h = 0.6
    }

    type = 'non-interactive'
    img = 'led'
    nodes = ['input']
    color = '#FF0000'

    offset = {
        input: { x: 0, y: -0.5 },
    }

    get state () {
            return this.logic();
    }

    logic() {
        if (this.input.state) {
            return 1;
        } else {
            return 0;
        }
    }


    shape = shape.led
}

class OnOffSwitch extends Generic{
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.w = 0.5;
        this.h = 0.65;
        this.offset = {
            output: { x: 0, y: 0.5 },
        }

    }

    type = 'interactive'
    img = 'button'
    color = '#27CF00'

    state = 0

    // changes state of switch between 0 and 1
    get changeState () {
        this.state ^= 1;
        this.output.setter = this.state
    }

    shape = shape.switch

    serialize(){
        return JSON.stringify(this);
    }
}

class Clock extends Generic{
    constructor(x,y,r,id,frequency) {
        super(x,y,r,id);

        this.w = 0.6;
        this.h = 0.6;
        this.frequency = frequency
        this.offset = {
            output: { x: 0.5, y: 0.0 },
        }
    }

    type = 'interactive'
    img = 'button'
    color = '#27CF00'

    state = 0
    frequency = 500

    get changeState () {
        this.state ^= 1;
        this.output.setter = this.state
    }

    shape = shape.clock
}

class AndGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('andgate');
    }

    logic() {
        if (this.input1.state && this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }
}

class NandGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('nandgate');
    }

    logic() {
        if (!this.input1.state || !this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }
}

class OrGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('orgate');
    }

    logic() {
        if (this.input1.state || this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }
}

class NorGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('norgate');
    }

    logic() {
        if (!this.input1.state && !this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }
}

class XorGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('xorgate');
    }

    logic() {
        if (this.input1.state * !this.input2.state + !this.input1.state * this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }
}

class XnorGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('xnorgate');
    }

    logic() {
        if (this.input1.state * this.input2.state + !this.input1.state * !this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }
}

class NotGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('notgate');
    }

    offset = {
        input: { x: 0, y: -0.5 },
        output: { x: 0, y: 0.5 },
    }

    logic() {
        if (!this.input.state) {
            return 1;
        } else {
            return 0;
        }
    }
}

class CustomComponent {
    constructor(x,y,r,w,h,id) {
        this.x = x
        this.y = y
        this.r = r
        this.id = id

        this.objects = {}
        this.wires = {}

        this.w = w
        this.h = h
        this.name = 'undefined'
        this.highlight = false;
        this.nodes = []
        this.offset =  {}
        this.image = document.getElementById('cc');
    }

    get gridCoordinates () {
        return { x: (-origin.x + this.x) * z, y: (origin.y - this.y) * z }
    }

    rotateNodes(dir) {
        for (let ele in this.offset) {
            let a = this.offset[ele].x
            let b = this.offset[ele].y
            if (dir === 'right') [a, b] = [-b, a];
            if (dir === 'left') [a, b] = [b, -a];
            this.offset[ele].x = a
            this.offset[ele].y = b
        }
    }

    shape = shape.custom
}

const make = (function() {

    const makeSwitch = function (x,y,r) {
        let id = generateId()
        let nodes = ['output']
        objects[id] = new OnOffSwitch(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects)
    }

    const makeLed = function (x,y,r) {
        let id = generateId()
        let nodes = ['input']
        objects[id] = new Led(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects )
        return id
    }

    const makeClock = function  (x,y,r, frequency = 1000) {
        let id = generateId()
        let nodes = ['output']
        objects[id] = new Clock(x, y, r, id, frequency)
        defineNodes( id, nodes, objects[id], objects  )

        function clock() {
            objects[id].changeState
            setTimeout(clock, frequency);
        };

        clock();
    }

    const makeAnd = function (x,y,r) {
        let id = generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new AndGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeOr = function (x,y,r) {
        let id = generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new OrGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects )
    }

    const makeNor = function (x,y,r) {
        let id = generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new NorGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects )
    }

    const makeNand = function (x,y,r) {
        let id = generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new NandGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeNot = function (x,y,r) {
        let id = generateId()
        let nodes = ['input', 'output']
        objects[id] = new NotGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeXor = function (x,y,r) {
        let id = generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new XorGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeXnor = function (x,y,r) {
        let id = generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new XnorGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeNode = function (x,y,id,io) {
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

    return {
        switch: makeSwitch,
        led: makeLed,
        clock: makeClock,
        and: makeAnd,
        or: makeOr,
        nor: makeNor,
        nand: makeNand,
        not: makeNot,
        xor: makeXor,
        xnor: makeXnor,
        node: makeNode
    }

})();

export {
    Wire,
    TempLine,
    Node,
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
}