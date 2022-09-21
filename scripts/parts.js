'use strict';

import { generateId, color, easeOutBounce, easeInExpo } from './utilities.js'
import { shape } from './shapes.js'
import { defineNodes } from './main.js'

class Wire {
    constructor(node) {
        this.node = node


        this.id;
        this.nodes = [];

        // connect directly or along grid
        this.direct = true
        this.highlight = false;
        this.classname = this.constructor.name;          
    }

    get loc() {
        return { 
            a: { x: this.node.a.x , y: this.node.a.y },
            b: { x: this.node.b.x , y: this.node.b.y },
        }
    }

    //reduced(array) { return array.reduce((partialSum, a) => partialSum + a, 0); }
    nodeState = { a: 0, b: 0}
    storeState = 0

    get state () {
        //update nodes on state change
        if (this.node.a.state !== this.nodeState.a) {
            if (this.node.a.state === undefined) {
                this.node.a.state = 0
            }
            this.storeState = this.node.a.state
        }

        if(this.node.b.state !== this.nodeState.b) {
            if (this.node.b.state === undefined) {
                this.node.b.state = 0
            }
            this.storeState = this.node.b.state
        }

        this.node.a.state = this.storeState;
        this.node.b.state = this.storeState;
        this.nodeState.a = this.storeState
        this.nodeState.b = this.storeState

        for (let n of this.nodes) {
            n.setter = this.storeState
        }
        return this.storeState;
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

        if (this.wireId && wires[this.wireId] === undefined) {
            console.error(`Wire ${this.wireId} does not exist`)
            return
        }
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
        this.hitbox = { w: .5, h: .6 }
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
    img = 'canvasPath'

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
            this.offset[ele].x = a;
            this.offset[ele].y = b;
        }
        [this.hitbox.w, this.hitbox.h] = [this.hitbox.h, this.hitbox.w];
    }
}

class Led extends Generic{
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.w = 0.4
        this.h = 0.6
        this.hitbox = { w: .4, h: .6 }
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

class Label extends Generic{
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.w = 0.7
        this.h = 0.3
        this.name = 'undefined'
        this.nodes = []
        this.hitbox = { w: this.w, h: this.h }
        this.offset =  {}
    }

    type = 'non-interactive'
    //img = 'led'
    color = color.background

    state = undefined

    shape = shape.label
}

class OnOffSwitch extends Generic{
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.w = 0.5;
        this.h = 0.65;
        this.hitbox = { w: .5, h: .65 }
        this.offset = {
            output: { x: 0, y: 0.5 },
        }

        this.swLocation = 1
        this.classname = 'Switch'
    }

    type = 'interactive'
    img = 'button'
    color = color.background

    state = 0

    // changes state of switch between 0 and 1
    get changeState () {
        this.state ^= 1;
        this.animate();
        this.output.setter = this.state;
    }

    animate() {
        const self = this
        let i = 0
        iterate()
        function iterate () {
            setTimeout(function() {
                if (self.state) self.swLocation = 1 - easeOutBounce(i/40)
                if (!self.state) self.swLocation = easeOutBounce(i/40)
            i++
            if (i < 40) {        
                iterate();
            }           
            if (i === 40) self.swLocation = !self.state
            }, 6)          
        }
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
        this.hitbox = { w: .6, h: .6 }
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

class ConstantHigh extends Generic{
    constructor(x,y,r,id,frequency) {
        super(x,y,r,id);

        this.w = 0.6;
        this.h = 0.6;
        this.hitbox = { w: .6, h: .6 }
        this.frequency = frequency
        this.offset = {
            output: { x: 0.5, y: 0.0 },
        }
    }

    type = 'interactive'
    img = 'button'
    color = '#27CF00'

    state = 1

    get changeState () {
        this.output.setter = this.state
    }

    shape = shape.constant
}

class AndGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);
    }

    logic() {
        if (this.input1.state && this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }

    shape = shape.and
}

class NandGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);
    }

    logic() {
        if (!this.input1.state || !this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }

    shape = shape.nand
}

class OrGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);
    }

    logic() {
        if (this.input1.state || this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }

    shape = shape.or
}

class NorGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);
    }


    logic() {
        if (!this.input1.state && !this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }

    shape = shape.nor
}

class XorGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);
    }

    logic() {
        if (this.input1.state * !this.input2.state + !this.input1.state * this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }

    shape = shape.xor
}

class XnorGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);
    }

    logic() {
        if (this.input1.state * this.input2.state + !this.input1.state * !this.input2.state) {
            return 1;
        } else {
            return 0;
        }
    }

    shape = shape.xnor
}

class NotGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);
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

    shape = shape.not
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
        this.hitbox = { w: w, h: h }
        this.name = 'New Component'
        this.highlight = false;
        this.nodes = []
        this.offset =  {}
        this.image = document.getElementById('cc');
        this.classname = this.constructor.name;
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
        [this.hitbox.w, this.hitbox.h] = [this.hitbox.h, this.hitbox.w];
        // let w = this.w;
        // let h = this.h;
        // this.w = h;
        // this.h = w;
    }

    shape = shape.custom
}

const make = (function() {

    const makeSwitch = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['output']
        objects[id] = new OnOffSwitch(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects)
    }

    const makeLed = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['input']
        objects[id] = new Led(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects )
        return id
    }

    const makeLabel = function (x,y,r,id) {
        id = id || generateId()
        let nodes = []
        objects[id] = new Label(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects )
        return id
    }

    const makeClock = function  (x,y,r, frequency = 1000,id) {
        id = id || generateId()
        let nodes = ['output']
        objects[id] = new Clock(x, y, r, id, frequency)
        defineNodes( id, nodes, objects[id], objects  )

        function clock() {
            objects[id].changeState
            setTimeout(clock, frequency);
        };

        clock();
    }

    const makeConstantHigh = function  (x,y,r,id) {
        id = id || generateId()
        let nodes = ['output']
        objects[id] = new ConstantHigh(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )

        function setState() {
            objects[id].changeState
        };

        setState()
    }

    const makeAnd = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new AndGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeOr = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new OrGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects )
    }

    const makeNor = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new NorGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects )
    }

    const makeNand = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new NandGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeNot = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['input', 'output']
        objects[id] = new NotGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeXor = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new XorGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeXnor = function (x,y,r,id) {
        id = id || generateId()
        let nodes = ['input1', 'input2', 'output']
        objects[id] = new XnorGate(x, y, r, id)
        defineNodes( id, nodes, objects[id], objects  )
    }

    const makeNode = function (x,y,id,io) {
        let node = new Node(id, wires, io)

        Object.defineProperty(node, 'x', {
            value: x,
            writable: true,
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(node, 'y', {
            value: y,
            writable: true,
            enumerable: true,
            configurable: true
        });

        node.state = wires[id].state
        return node
    }

    const fullAdder = {
        1: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":-0.5,\"y\":2,\"r\":0,\"id\":1,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"XorGate\"}}",
        2: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0,\"y\":4,\"r\":0,\"id\":2,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"XorGate\"}}",
        3: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1.5,\"y\":4,\"r\":0,\"id\":3,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"AndGate\"}}",
        4: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2.5,\"y\":4,\"r\":0,\"id\":4,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"AndGate\"}}",
        5: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2,\"y\":5.5,\"r\":0,\"id\":5,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"OrGate\"}}",
        6: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0,\"y\":7,\"r\":0,\"id\":6,\"w\":0.4,\"h\":0.6,\"hitbox\":{\"w\":0.4,\"h\":0.6},\"name\":\"Sum\",\"highlight\":true,\"offset\":{\"input\":{\"x\":0,\"y\":-0.5}},\"classname\":\"Led\",\"type\":\"non-interactive\",\"nodes\":[\"input\"],\"color\":\"#FF0000\"}}",
        7: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2,\"y\":7,\"r\":0,\"id\":7,\"w\":0.4,\"h\":0.6,\"hitbox\":{\"w\":0.4,\"h\":0.6},\"name\":\"Carry-Out\",\"highlight\":true,\"offset\":{\"input\":{\"x\":0,\"y\":-0.5}},\"classname\":\"Led\",\"type\":\"non-interactive\",\"nodes\":[\"input\"],\"color\":\"#FF0000\"}}",
        8: "{\"type\":\"wire\",\"a\":{\"id\":\"5\",\"name\":\"output\"},\"b\":{\"id\":7,\"name\":\"input\"},\"nodes\":[]}",
        9: "{\"type\":\"wire\",\"a\":{\"id\":6,\"name\":\"input\"},\"b\":{\"id\":\"2\",\"name\":\"output\"},\"nodes\":[]}",
        10: "{\"type\":\"wire\",\"a\":{\"id\":\"3\",\"name\":\"output\"},\"b\":{\"id\":\"5\",\"name\":\"input1\"},\"nodes\":[]}",
        11: "{\"type\":\"wire\",\"a\":{\"id\":\"5\",\"name\":\"input2\"},\"b\":{\"id\":\"4\",\"name\":\"output\"},\"nodes\":[]}",
        12: "{\"type\":\"wire\",\"a\":{\"id\":\"1\",\"name\":\"output\"},\"b\":{\"id\":\"2\",\"name\":\"input1\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":12,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":-0.5,\"y\":3,\"wireId\":\"13\"}]}",
        13: "{\"type\":\"wire\",\"a\":{\"id\":12,\"name\":\"output\"},\"b\":{\"id\":\"3\",\"name\":\"input1\"},\"nodes\":[]}",
        14: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":-1,\"y\":0,\"r\":0,\"id\":14,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"A\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        15: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0,\"y\":0,\"r\":0,\"id\":15,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"B\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        16: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1,\"y\":0,\"r\":0,\"id\":16,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"Carry-In\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        17: "{\"type\":\"wire\",\"a\":{\"id\":\"14\",\"name\":\"output\"},\"b\":{\"id\":\"1\",\"name\":\"input1\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":17,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":-1,\"y\":1,\"wireId\":\"21\"}]}",
        18: "{\"type\":\"wire\",\"a\":{\"id\":\"16\",\"name\":\"output\"},\"b\":{\"id\":\"2\",\"name\":\"input2\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":18,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":0.5,\"y\":2,\"wireId\":\"19\"}]}",
        19: "{\"type\":\"wire\",\"a\":{\"id\":18,\"name\":\"output\"},\"b\":{\"id\":\"3\",\"name\":\"input2\"},\"nodes\":[]}",
        20: "{\"type\":\"wire\",\"a\":{\"id\":\"15\",\"name\":\"output\"},\"b\":{\"id\":\"1\",\"name\":\"input2\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":20,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":0,\"y\":1,\"wireId\":\"22\"}]}",
        21: "{\"type\":\"wire\",\"a\":{\"id\":17,\"name\":\"output\"},\"b\":{\"id\":\"4\",\"name\":\"input1\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":21,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":2,\"y\":1.5}]}",
        22: "{\"type\":\"wire\",\"a\":{\"id\":20,\"name\":\"output\"},\"b\":{\"id\":\"4\",\"name\":\"input2\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":22,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":2.5,\"y\":1}]}",
        23: "{\"type\":\"customcomponent\",\"component\":{\"x\":0,\"y\":0,\"r\":0,\"id\":\"23\",\"w\":0.5,\"h\":1,\"hitbox\":{\"w\":0.5,\"h\":1},\"name\":\"Full Adder\",\"highlight\":true,\"nodes\":[\"Sum\",\"Carry-Out\",\"A\",\"B\",\"Carry-In\"],\"offset\":{\"A\":{\"x\":-0.5,\"y\":0.25},\"B\":{\"x\":-0.5,\"y\":-0.25},\"Carry-In\":{\"x\":-0.5,\"y\":0},\"Sum\":{\"x\":0.5,\"y\":0.25},\"Carry-Out\":{\"x\":0.5,\"y\":-0.25}},\"image\":{},\"classname\":\"CustomComponent\",\"Sum\":{\"name\":\"Sum\",\"type\":\"node\",\"id\":\"23\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":0.25},\"Carry-Out\":{\"name\":\"Carry-Out\",\"type\":\"node\",\"id\":\"23\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":-0.25},\"A\":{\"name\":\"A\",\"type\":\"node\",\"id\":\"23\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":-0.5,\"y\":0.25},\"B\":{\"name\":\"B\",\"type\":\"node\",\"id\":\"23\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":-0.5,\"y\":-0.25},\"Carry-In\":{\"name\":\"Carry-In\",\"type\":\"node\",\"id\":\"23\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":-0.5,\"y\":0}},\"list\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"14\",\"15\",\"16\"],\"wires\":[\"8\",\"9\",\"10\",\"11\",\"12\",\"13\",\"17\",\"18\",\"19\",\"20\",\"21\",\"22\"]}"
    }

    const srFlipFlop = {
        1: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0.5,\"y\":-0.5,\"r\":0,\"id\":1,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"S\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        2: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2,\"y\":-0.5,\"r\":0,\"id\":2,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"Enable\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        3: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":3,\"y\":-0.5,\"r\":0,\"id\":3,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"R\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        4: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1,\"y\":5,\"r\":0,\"id\":4,\"w\":0.4,\"h\":0.6,\"hitbox\":{\"w\":0.4,\"h\":0.6},\"name\":\"Q\",\"highlight\":true,\"offset\":{\"input\":{\"x\":0,\"y\":-0.5}},\"classname\":\"Led\",\"type\":\"non-interactive\",\"nodes\":[\"input\"],\"color\":\"#FF0000\"}}",
        5: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2.5,\"y\":5,\"r\":0,\"id\":5,\"w\":0.4,\"h\":0.6,\"hitbox\":{\"w\":0.4,\"h\":0.6},\"name\":\"-Q\",\"highlight\":true,\"offset\":{\"input\":{\"x\":0,\"y\":-0.5}},\"classname\":\"Led\",\"type\":\"non-interactive\",\"nodes\":[\"input\"],\"color\":\"#FF0000\"}}",
        6: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1,\"y\":1.5,\"r\":0,\"id\":6,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"AndGate\"}}",
        7: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2.5,\"y\":1.5,\"r\":0,\"id\":7,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"AndGate\"}}",
        8: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1,\"y\":3,\"r\":0,\"id\":8,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"NorGate\"}}",
        9: "{\"type\":\"object\",\"component\":{\"temp\":1,\"x\":2.5,\"y\":3,\"r\":0,\"id\":9,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"NorGate\"}}",
        10: "{\"type\":\"wire\",\"a\":{\"id\":8,\"name\":\"output\"},\"b\":{\"id\":4,\"name\":\"input\"},\"nodes\":[{\"name\":\"output\",\"connectionType\":\"wires\",\"type\":\"node\",\"id\":10,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":1,\"y\":4,\"wireId\":13}]}",
        11: "{\"type\":\"wire\",\"a\":{\"id\":9,\"name\":\"output\"},\"b\":{\"id\":5,\"name\":\"input\"},\"nodes\":[{\"name\":\"output\",\"connectionType\":\"wires\",\"type\":\"node\",\"id\":11,\"state\":1,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":2.5,\"y\":4,\"wireId\":12}]}",
        12: "{\"type\":\"wire\",\"a\":{\"id\":11,\"name\":\"output\"},\"b\":{\"id\":8,\"name\":\"input2\"},\"nodes\":[]}",
        13: "{\"type\":\"wire\",\"a\":{\"id\":10,\"name\":\"output\"},\"b\":{\"id\":9,\"name\":\"input1\"},\"nodes\":[]}",
        14: "{\"type\":\"wire\",\"a\":{\"id\":6,\"name\":\"output\"},\"b\":{\"id\":8,\"name\":\"input1\"},\"nodes\":[]}",
        15: "{\"type\":\"wire\",\"a\":{\"id\":7,\"name\":\"output\"},\"b\":{\"id\":9,\"name\":\"input2\"},\"nodes\":[]}",
        16: "{\"type\":\"wire\",\"a\":{\"id\":2,\"name\":\"output\"},\"b\":{\"id\":6,\"name\":\"input2\"},\"nodes\":[{\"name\":\"output\",\"connectionType\":\"wires\",\"type\":\"node\",\"id\":16,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":1.5,\"y\":0.5,\"wireId\":17}]}",
        17: "{\"type\":\"wire\",\"a\":{\"id\":16,\"name\":\"output\"},\"b\":{\"id\":7,\"name\":\"input1\"},\"nodes\":[]}",
        18: "{\"type\":\"wire\",\"a\":{\"id\":1,\"name\":\"output\"},\"b\":{\"id\":6,\"name\":\"input1\"},\"nodes\":[]}",
        19: "{\"type\":\"wire\",\"a\":{\"id\":3,\"name\":\"output\"},\"b\":{\"id\":7,\"name\":\"input2\"},\"nodes\":[]}",
        20: "{\"type\":\"customcomponent\",\"component\":{\"x\":0,\"y\":0,\"r\":0,\"id\":20,\"w\":0.5,\"h\":1,\"hitbox\":{\"w\":0.5,\"h\":1},\"name\":\"Gated SR Flip-Flop\",\"highlight\":true,\"nodes\":[\"S\",\"Enable\",\"R\",\"Q\",\"-Q\"],\"offset\":{\"S\":{\"x\":-0.5,\"y\":0.25},\"Enable\":{\"x\":-0.5,\"y\":-0.25},\"R\":{\"x\":-0.5,\"y\":0},\"Q\":{\"x\":0.5,\"y\":0.25},\"-Q\":{\"x\":0.5,\"y\":-0.25}},\"image\":{},\"classname\":\"CustomComponent\",\"S\":{\"name\":\"S\",\"type\":\"node\",\"id\":20,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":-0.5,\"y\":0.25},\"Enable\":{\"name\":\"Enable\",\"type\":\"node\",\"id\":20,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":-0.5,\"y\":-0.25},\"R\":{\"name\":\"R\",\"type\":\"node\",\"id\":20,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":-0.5,\"y\":0},\"Q\":{\"name\":\"Q\",\"type\":\"node\",\"id\":20,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":0.25},\"-Q\":{\"name\":\"-Q\",\"type\":\"node\",\"id\":20,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":-0.25}},\"list\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"8\",\"9\"],\"wires\":[\"10\",\"11\",\"12\",\"13\",\"14\",\"15\",\"16\",\"17\",\"18\",\"19\"]}"
    }

    const multiplexer = {
        1: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0.5,\"y\":1,\"r\":0,\"id\":1,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"AndGate\"}}",
        2: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1.5,\"y\":1,\"r\":0,\"id\":2,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"AndGate\"}}",
        3: "{\"type\":\"object\",\"component\":{\"temp\":1,\"x\":1,\"y\":-0.5,\"r\":0,\"id\":3,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input\":{\"x\":0,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"NotGate\"}}",
        4: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1,\"y\":2.5,\"r\":0,\"id\":4,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"OrGate\"}}",
        5: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0,\"y\":-2,\"r\":0,\"id\":5,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"D0\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        6: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1.5,\"y\":-2,\"r\":0,\"id\":6,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"D1\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        7: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2.5,\"y\":-1.5,\"r\":0,\"id\":7,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"Select\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        8: "{\"type\":\"wire\",\"a\":{\"id\":\"7\",\"name\":\"output\"},\"b\":{\"id\":\"3\",\"name\":\"input\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":8,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":2,\"y\":-1,\"wireId\":\"9\"}]}",
        9: "{\"type\":\"wire\",\"a\":{\"id\":8,\"name\":\"output\"},\"b\":{\"id\":\"2\",\"name\":\"input2\"},\"nodes\":[]}",
        10: "{\"type\":\"wire\",\"a\":{\"id\":\"3\",\"name\":\"output\"},\"b\":{\"id\":\"1\",\"name\":\"input2\"},\"nodes\":[]}",
        11: "{\"type\":\"wire\",\"a\":{\"id\":\"1\",\"name\":\"input1\"},\"b\":{\"id\":\"5\",\"name\":\"output\"},\"nodes\":[]}",
        12: "{\"type\":\"wire\",\"a\":{\"id\":\"6\",\"name\":\"output\"},\"b\":{\"id\":\"2\",\"name\":\"input1\"},\"nodes\":[]}",
        13: "{\"type\":\"wire\",\"a\":{\"id\":\"1\",\"name\":\"output\"},\"b\":{\"id\":\"4\",\"name\":\"input1\"},\"nodes\":[]}",
        14: "{\"type\":\"wire\",\"a\":{\"id\":\"2\",\"name\":\"output\"},\"b\":{\"id\":\"4\",\"name\":\"input2\"},\"nodes\":[]}",
        15: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1,\"y\":4,\"r\":0,\"id\":15,\"w\":0.4,\"h\":0.6,\"hitbox\":{\"w\":0.4,\"h\":0.6},\"name\":\"Output\",\"highlight\":true,\"offset\":{\"input\":{\"x\":0,\"y\":-0.5}},\"classname\":\"Led\",\"type\":\"non-interactive\",\"nodes\":[\"input\"],\"color\":\"#FF0000\"}}",
        16: "{\"type\":\"wire\",\"a\":{\"id\":15,\"name\":\"input\"},\"b\":{\"id\":\"4\",\"name\":\"output\"},\"nodes\":[]}",
        17: "{\"type\":\"customcomponent\",\"component\":{\"x\":1,\"y\":0.5,\"r\":0,\"id\":\"17\",\"w\":0.5,\"h\":1,\"hitbox\":{\"w\":0.5,\"h\":1},\"name\":\"Multiplexer\",\"highlight\":true,\"nodes\":[\"D0\",\"D1\",\"Select\",\"Output\"],\"offset\":{\"D0\":{\"x\":-0.5,\"y\":0.25},\"D1\":{\"x\":-0.5,\"y\":-0.25},\"Select\":{\"x\":-0.5,\"y\":0},\"Output\":{\"x\":0.5,\"y\":0}},\"image\":{},\"classname\":\"CustomComponent\",\"D0\":{\"name\":\"D0\",\"type\":\"node\",\"id\":\"17\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":0.75},\"D1\":{\"name\":\"D1\",\"type\":\"node\",\"id\":\"17\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":0.25},\"Select\":{\"name\":\"Select\",\"type\":\"node\",\"id\":\"17\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":0.5},\"Output\":{\"name\":\"Output\",\"type\":\"node\",\"id\":\"17\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":1.5,\"y\":0.5}},\"list\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"15\"],\"wires\":[\"8\",\"9\",\"10\",\"11\",\"12\",\"13\",\"14\",\"16\"]}"
    }

    return {
        switch: makeSwitch,
        led: makeLed,
        clock: makeClock,
        and: makeAnd,
        ConstantHigh: makeConstantHigh,
        or: makeOr,
        nor: makeNor,
        nand: makeNand,
        not: makeNot,
        xor: makeXor,
        xnor: makeXnor,
        node: makeNode,
        label: makeLabel,
        fullAdder: fullAdder,
        srFlipFlop: srFlipFlop,
        multiplexer: multiplexer,
    }

})();


export {
    Wire,
    TempLine,
    Node,
    Led,
    Label,
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
}