'use strict';

import { generateId, color } from './utilities.js'
import { shape } from './shapes.js'
import { defineNodes } from './main.js'

class Wire {
    constructor(node) {
        this.node = node


        this.id;
        this.nodes = [];

        // connect directly or along grid
        this.direct = true
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

        this.classname = 'Switch'
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
        this.name = 'undefined'
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

    const halfAdder = {
        24: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":-0.5,\"y\":-0.5,\"r\":0,\"id\":24,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"A\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        25: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0.5,\"y\":-0.5,\"r\":0,\"id\":25,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"B\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        26: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2,\"y\":-0.5,\"r\":0,\"id\":26,\"w\":0.5,\"h\":0.65,\"hitbox\":{\"w\":0.5,\"h\":0.65},\"name\":\"Carry-In\",\"highlight\":true,\"offset\":{\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"Switch\",\"type\":\"interactive\",\"color\":\"#27CF00\",\"state\":0}}",
        27: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0,\"y\":1.5,\"r\":0,\"id\":27,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"XorGate\"}}",
        28: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0.5,\"y\":3.5,\"r\":0,\"id\":28,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"XorGate\"}}",
        29: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":1.5,\"y\":3.5,\"r\":0,\"id\":29,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"AndGate\"}}",
        30: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2.5,\"y\":3.5,\"r\":0,\"id\":30,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"AndGate\"}}",
        31: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2,\"y\":5,\"r\":0,\"id\":31,\"w\":0.5,\"h\":0.6,\"hitbox\":{\"w\":0.5,\"h\":0.6},\"name\":\"undefined\",\"highlight\":true,\"offset\":{\"input1\":{\"x\":-0.25,\"y\":-0.5},\"input2\":{\"x\":0.25,\"y\":-0.5},\"output\":{\"x\":0,\"y\":0.5}},\"classname\":\"OrGate\"}}",
        32: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":0.5,\"y\":6.5,\"r\":0,\"id\":32,\"w\":0.4,\"h\":0.6,\"hitbox\":{\"w\":0.4,\"h\":0.6},\"name\":\"Sum\",\"highlight\":true,\"offset\":{\"input\":{\"x\":0,\"y\":-0.5}},\"classname\":\"Led\",\"type\":\"non-interactive\",\"nodes\":[\"input\"],\"color\":\"#FF0000\"}}",
        33: "{\"type\":\"object\",\"component\":{\"temp\":0,\"x\":2,\"y\":6.5,\"r\":0,\"id\":33,\"w\":0.4,\"h\":0.6,\"hitbox\":{\"w\":0.4,\"h\":0.6},\"name\":\"Carry-Out\",\"highlight\":true,\"offset\":{\"input\":{\"x\":0,\"y\":-0.5}},\"classname\":\"Led\",\"type\":\"non-interactive\",\"nodes\":[\"input\"],\"color\":\"#FF0000\"}}",
        34: "{\"type\":\"wire\",\"a\":{\"id\":\"31\",\"name\":\"output\"},\"b\":{\"id\":33,\"name\":\"input\"},\"nodes\":[]}",
        35: "{\"type\":\"wire\",\"a\":{\"id\":\"29\",\"name\":\"output\"},\"b\":{\"id\":\"31\",\"name\":\"input1\"},\"nodes\":[]}",
        36: "{\"type\":\"wire\",\"a\":{\"id\":\"30\",\"name\":\"output\"},\"b\":{\"id\":\"31\",\"name\":\"input2\"},\"nodes\":[]}",
        37: "{\"type\":\"wire\",\"a\":{\"id\":\"28\",\"name\":\"output\"},\"b\":{\"id\":32,\"name\":\"input\"},\"nodes\":[]}",
        38: "{\"type\":\"wire\",\"a\":{\"id\":\"24\",\"name\":\"output\"},\"b\":{\"id\":\"27\",\"name\":\"input1\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":38,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":-0.5,\"y\":0.5,\"wireId\":\"44\"}]}",
        39: "{\"type\":\"wire\",\"a\":{\"id\":\"27\",\"name\":\"input2\"},\"b\":{\"id\":\"25\",\"name\":\"output\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":39,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":0.5,\"y\":0.5,\"wireId\":\"45\"}]}",
        40: "{\"type\":\"wire\",\"a\":{\"id\":\"27\",\"name\":\"output\"},\"b\":{\"id\":\"28\",\"name\":\"input1\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":40,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":0,\"y\":2.5,\"wireId\":\"41\"}]}",
        41: "{\"type\":\"wire\",\"a\":{\"id\":40,\"name\":\"output\"},\"b\":{\"id\":\"29\",\"name\":\"input1\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":41,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":1,\"y\":2.5}]}",
        42: "{\"type\":\"wire\",\"a\":{\"id\":\"26\",\"name\":\"output\"},\"b\":{\"id\":\"28\",\"name\":\"input2\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":42,\"state\":0,\"highlight\":false,\"connected\":true,\"classname\":\"Node\",\"x\":1,\"y\":1.5,\"wireId\":\"43\"}]}",
        43: "{\"type\":\"wire\",\"a\":{\"id\":42,\"name\":\"output\"},\"b\":{\"id\":\"29\",\"name\":\"input2\"},\"nodes\":[]}",
        44: "{\"type\":\"wire\",\"a\":{\"id\":38,\"name\":\"output\"},\"b\":{\"id\":\"30\",\"name\":\"input1\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":44,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":2,\"y\":1}]}",
        45: "{\"type\":\"wire\",\"a\":{\"id\":39,\"name\":\"output\"},\"b\":{\"id\":\"30\",\"name\":\"input2\"},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":45,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":2.5,\"y\":0.5}]}",
        46: "{\"type\":\"customcomponent\",\"component\":{\"x\":1.5,\"y\":4,\"r\":0,\"id\":\"46\",\"wires\":{\"34\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":\"31\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"34\",\"x\":0,\"y\":0},\"b\":{\"name\":\"input\",\"type\":\"node\",\"id\":33,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"34\"}},\"nodes\":[],\"direct\":true,\"classname\":\"Wire\",\"id\":\"34\"},\"35\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":\"29\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"35\",\"x\":0,\"y\":0},\"b\":{\"name\":\"input1\",\"type\":\"node\",\"id\":\"31\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"35\",\"x\":0,\"y\":0}},\"nodes\":[],\"direct\":true,\"classname\":\"Wire\",\"id\":\"35\"},\"36\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":\"30\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"36\",\"x\":0,\"y\":0},\"b\":{\"name\":\"input2\",\"type\":\"node\",\"id\":\"31\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"36\",\"x\":0,\"y\":0}},\"nodes\":[],\"direct\":true,\"classname\":\"Wire\",\"id\":\"36\"},\"37\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":\"28\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"37\",\"x\":0,\"y\":0},\"b\":{\"name\":\"input\",\"type\":\"node\",\"id\":32,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"37\"}},\"nodes\":[],\"direct\":true,\"classname\":\"Wire\",\"id\":\"37\"},\"38\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":\"24\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"38\",\"x\":0,\"y\":0},\"b\":{\"name\":\"input1\",\"type\":\"node\",\"id\":\"27\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"38\",\"x\":0,\"y\":0}},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":38,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":-0.5,\"y\":0.5,\"wireId\":\"44\"}],\"direct\":true,\"classname\":\"Wire\",\"id\":\"38\"},\"39\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"input2\",\"type\":\"node\",\"id\":\"27\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"39\",\"x\":0,\"y\":0},\"b\":{\"name\":\"output\",\"type\":\"node\",\"id\":\"25\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"39\",\"x\":0,\"y\":0}},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":39,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":0.5,\"wireId\":\"45\"}],\"direct\":true,\"classname\":\"Wire\",\"id\":\"39\"},\"40\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":\"27\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"40\",\"x\":0,\"y\":0},\"b\":{\"name\":\"input1\",\"type\":\"node\",\"id\":\"28\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"40\",\"x\":0,\"y\":0}},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":40,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0,\"y\":2.5,\"wireId\":\"41\"}],\"direct\":true,\"classname\":\"Wire\",\"id\":\"40\"},\"41\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":40,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0,\"y\":2.5,\"wireId\":\"41\"},\"b\":{\"name\":\"input1\",\"type\":\"node\",\"id\":\"29\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"41\",\"x\":0,\"y\":0}},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":41,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":1,\"y\":2.5}],\"direct\":true,\"classname\":\"Wire\",\"id\":\"41\"},\"42\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":\"26\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"42\",\"x\":0,\"y\":0},\"b\":{\"name\":\"input2\",\"type\":\"node\",\"id\":\"28\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"42\",\"x\":0,\"y\":0}},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":42,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":1,\"y\":1.5,\"wireId\":\"43\"}],\"direct\":true,\"classname\":\"Wire\",\"id\":\"42\"},\"43\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":42,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":1,\"y\":1.5,\"wireId\":\"43\"},\"b\":{\"name\":\"input2\",\"type\":\"node\",\"id\":\"29\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"43\",\"x\":0,\"y\":0}},\"nodes\":[],\"direct\":true,\"classname\":\"Wire\",\"id\":\"43\"},\"44\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":38,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":-0.5,\"y\":0.5,\"wireId\":\"44\"},\"b\":{\"name\":\"input1\",\"type\":\"node\",\"id\":\"30\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"44\",\"x\":0,\"y\":0}},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":44,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":2,\"y\":1}],\"direct\":true,\"classname\":\"Wire\",\"id\":\"44\"},\"45\":{\"nodeState\":{\"a\":0,\"b\":0},\"storeState\":0,\"node\":{\"a\":{\"name\":\"output\",\"type\":\"node\",\"id\":39,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":0.5,\"y\":0.5,\"wireId\":\"45\"},\"b\":{\"name\":\"input2\",\"type\":\"node\",\"id\":\"30\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"wireId\":\"45\",\"x\":0,\"y\":0}},\"nodes\":[{\"name\":\"output\",\"type\":\"node\",\"id\":45,\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":2.5,\"y\":0.5}],\"direct\":true,\"classname\":\"Wire\",\"id\":\"45\"}},\"w\":0.5,\"h\":1,\"hitbox\":{\"w\":0.5,\"h\":1},\"name\":\"Full-Adder\",\"highlight\":true,\"nodes\":[\"A\",\"B\",\"Carry-In\",\"Sum\",\"Carry-Out\"],\"offset\":{\"A\":{\"x\":-0.5,\"y\":0.25},\"B\":{\"x\":-0.5,\"y\":-0.25},\"Carry-In\":{\"x\":-0.5,\"y\":0},\"Sum\":{\"x\":0.5,\"y\":0.25},\"Carry-Out\":{\"x\":0.5,\"y\":-0.25}},\"image\":{},\"classname\":\"CustomComponent\",\"A\":{\"name\":\"A\",\"type\":\"node\",\"id\":\"46\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":1,\"y\":4.25},\"B\":{\"name\":\"B\",\"type\":\"node\",\"id\":\"46\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":1,\"y\":3.75},\"Carry-In\":{\"name\":\"Carry-In\",\"type\":\"node\",\"id\":\"46\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":1,\"y\":4},\"Sum\":{\"name\":\"Sum\",\"type\":\"node\",\"id\":\"46\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":2,\"y\":4.25},\"Carry-Out\":{\"name\":\"Carry-Out\",\"type\":\"node\",\"id\":\"46\",\"state\":0,\"highlight\":false,\"connected\":false,\"classname\":\"Node\",\"x\":2,\"y\":3.75}},\"list\":[\"24\",\"25\",\"26\",\"27\",\"28\",\"29\",\"30\",\"31\",\"32\",\"33\"]}",
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
        halfAdder: halfAdder,
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