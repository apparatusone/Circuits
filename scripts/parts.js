'use strict';




function stringInString (a,b) {
    const regex = new RegExp( a, 'gi' );
    return regex.test(b)
}

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
        let state;

        //update nodes on state change
        if (this.node.a.state !== this.nodeState.a) {
            state = this.node.a.state
        }

        if(this.node.b.state !== this.nodeState.b) {
            state = this.node.b.state
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

    // static fromJSON(serializedJson) {
    //     return Object.assign(new ExcitingMath(), JSON.parse(serializedJson))
    // }
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
    }

    set setter(state) {
        this.state = state
        if (this.wireId) wires[this.wireId].state
    }

    get x () { return this.connectionType[this.id].x + this.connectionType[this.id].offset[this.name].x };
    get y () { return this.connectionType[this.id].y + this.connectionType[this.id].offset[this.name].y };
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


    shape = ledPath
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

    shape = onOffSwitchPath
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

    shape = clockPath
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

    shape = custom
}

// gets list of nodes and adds nodes to gate
function defineNodes(id,nodes,object) {
    //set scope
    let self = objects[id]

    for (const node of nodes) {
        if (stringInString ('output',node)) {
            Object.defineProperty(object, node, {
                value: new Node(self.id, objects, node),
                writable: true
            });
        }
    }

    for (const node of nodes) {
        let targetObj = new Node(self.id, objects, node)
        //if node is an input, add proxy
        if (stringInString ('input',node)) {
            Object.defineProperty(object, node, {
                value: 
                    new Proxy(targetObj, {
                        set: function (target, key, value) {
                            target[key] = value;
                            self.state
                            return true;
                        }
                    }),
                writable: true
            });
        }
    }

    // adds list of nodes to gate
    Object.defineProperty(object, 'nodes', {
        value: nodes,
        writable: true
    });
}


// paths
function ledPath (x1, y1, a, b, z, w, h, context = ctx) {
    context.strokeStyle = 'rgba(0,0,0,1)';
    context.lineWidth = z/15;
    context.setLineDash([]);

    context.beginPath();
    context.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .10 * z, 0, 1 * Math.PI, true);
    context.lineTo((-a+ x1 + 0.4) * z, (b + y1 + .75) * z);
    context.lineTo((-a + x1 + 0.6) * z, (b + y1 + .75) * z);
    context.lineTo((-a + x1 + 0.6) * z, (b + y1 + 0.5) * z);
    context.stroke();
    context.fill();

    context.lineWidth = z/25;
    context.lineCap = 'butt';
    context.beginPath();
    context.lineTo((-a + x1 + 0.5) * z, (b + y1 + .75) * z);
    context.lineTo((-a + x1 + 0.5) * z, (b + y1 + 1) * z);
    context.stroke();
}

function clockPath (x1, y1, a, b, z, w, h, context = ctx) {
    context.strokeStyle = 'rgba(0,0,0,1)';
    context.lineWidth = z/15;
    context.setLineDash([]);

    context.beginPath();
    context.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .25 * z, 0, 2 * Math.PI, true);
    context.stroke();
    context.fill();

    context.lineWidth = z/25;
    context.lineCap = 'butt';
    context.beginPath();
    context.lineTo((-a + x1 + 0.75) * z, (b + y1 + 0.5) * z);
    context.lineTo((-a + x1 + 1.0) * z, (b + y1 + 0.5) * z);
    context.stroke();

    context.lineWidth = z/40;
    context.beginPath();
    context.lineTo((-a + x1 + 0.38) * z, (b + y1 + 0.6) * z);
    context.lineTo((-a + x1 + 0.38) * z, (b + y1 + 0.41) * z);
    context.lineTo((-a + x1 + 0.46) * z, (b + y1 + 0.41) * z);
    context.lineTo((-a + x1 + 0.46) * z, (b + y1 + 0.59) * z);
    context.lineTo((-a + x1 + 0.54) * z, (b + y1 + 0.59) * z);
    context.lineTo((-a + x1 + 0.54) * z, (b + y1 + 0.41) * z);
    context.lineTo((-a + x1 + 0.62) * z, (b + y1 + 0.41) * z);
    context.lineTo((-a + x1 + 0.62) * z, (b + y1 + 0.6) * z);
    context.stroke();
}

function onOffSwitchPath (x, y, a, b, z, w, h, context = ctx) {
    context.strokeStyle = 'rgba(0,0,0,1)';
    context.lineWidth = z/15;
    context.setLineDash([]);

    const top = (b + y + .2) * z;
    const left = (-a + x + .3) * z;
    const width = .4*z;
    const height = .6*z;
    const radius = .075*z;
    
    context.beginPath();
    context.moveTo(left + radius, top);
    context.lineTo(left + width - radius, top);
    context.arcTo(left + width, top, left + width, top + radius, radius);
    context.lineTo(left + width, top + height - radius);
    context.arcTo(left + width, top + height, left + width - radius, top + height, radius);
    context.lineTo(left + radius, top + height);
    context.arcTo(left, top + height, left, top + height - radius, radius);
    context.lineTo(left, top + radius);
    context.arcTo(left, top, left + radius, top, radius);
    context.stroke();
    context.fill()

    context.lineWidth = z/25;
    context.beginPath();
    context.lineTo((-a + x + 0.5) * z, (b + y + .3) * z);
    context.lineTo((-a + x + 0.5) * z, (b + y + .4) * z);
    context.stroke();
    
    context.beginPath();
    context.arc((-a + x + 0.5)* z, (b + y + 0.65) * z, .06*z, 0, 2 * Math.PI);
    context.stroke();

    context.lineCap = 'butt';
    context.beginPath();
    context.lineTo((-a + x + 0.5) * z, (b + y + 0) * z);
    context.lineTo((-a + x + 0.5) * z, (b + y + .2) * z);
    context.stroke();
}

function custom (x1, y1, a, b, z, w, h, context = ctx) {
    context.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = "#3E3F41";
    context.lineWidth = z/55;
    context.setLineDash([]);
    context.beginPath();

    let radius = .08
    let cornerRadius = { upperLeft: radius*z, upperRight: radius*z, lowerLeft: radius*z, lowerRight: radius*z };

    let width = w * z
    let height = h * z
    let x = ((-a + x1 + 0.5) * z) - (width/2)
    let y = ((b + y1 + .5) * z) - (height/2)

    ctx.beginPath();
    ctx.moveTo(x + cornerRadius.upperLeft, y);
    ctx.lineTo(x + width - cornerRadius.upperRight, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.upperRight);
    ctx.lineTo(x + width, y + height - cornerRadius.lowerRight);
    ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.lowerRight, y + height);
    ctx.lineTo(x + cornerRadius.lowerLeft, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.lowerLeft);
    ctx.lineTo(x, y + cornerRadius.upperLeft);
    ctx.quadraticCurveTo(x, y, x + cornerRadius.upperLeft, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    context.fillStyle = "grey";
    context.lineWidth = z/100;
    context.beginPath();
    context.arc(x + width/2, y + .05*z, .08 * z, 0, 1 * Math.PI, false);
    context.lineTo(x + width/2 - .08*z, y + .01*z);
    context.lineTo(x + width/2 + .08*z, y + .01*z);
    context.closePath();
    context.stroke();
    context.fill();
}

function icPins (x,y,a,b, context = ctx) {
    context.beginPath();
    context.rect((-a + x + 0.47) * z, (b + y + .45) * z, .06*z, .1*z);
    context.closePath();
    context.fill();
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
