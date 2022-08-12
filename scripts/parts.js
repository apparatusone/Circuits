'use strict';

class Wire {
    constructor(index1, node1, x1, y1) {
        this.index1 = index1;
        this.index2 = index1;
        this.node1 = node1;
        this.node2 = node1;
        this.wireCoordinates;
        this.id = generateId();
        this.direct;                    // connect directly or along grid
    }

    type = 'wire'
    wireCoordinates = [4,3] // test wire node

    get x1 () {
        return objects[this.index1][this.node1].x
    }

    get y1 () {
        return objects[this.index1][this.node1].y
    }

    get x2 () {
        return objects[this.index2][this.node2].x
    }

    get y2 () {
        return objects[this.index2][this.node2].y
    }

    get state () {
        return objects[this.index1].state
    }
}

class TempLine {
    constructor(index1, node1) {
        this.index1 = index1;
        this.node1 = node1;
        this.x2;
        this.y2;
    }

    get x1 () { return objects[this.index1][this.node1].x }
    get y1 () { return objects[this.index1][this.node1].y }
}

class Generic {
    constructor(x,y,r,id) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.id = id;
    }

    type = 'non-interactive'
    img = 'svg'
    highlight = false;

//location of the nodes relative to the center of the cell
    offset = {
        input1: { x: -0.25, y: -0.5 },
        input2: { x: 0.25, y: -0.5 },
        output: { x: 0, y: 0.5 },
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

class OnOff extends Generic{
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.state = 0;
        this.image = document.getElementById('onoff');
    }

    type = 'interactive'
    img = 'button'
    color = '#27CF00'

    offset = {
        output: { x: 0, y: 0.5 },
    }
// changes state of switch between 0 and 1
    get changeState () {
        this.state ^= 1;
    }

    shape (x, y, a, b) {
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = z/15;
        ctx.setLineDash([]);

        const top = (b + y + .2) * z;
        const left = (-a + x + .3) * z;
        const width = .4*z;
        const height = .6*z;
        const radius = .075*z;
        
        ctx.beginPath();
        ctx.moveTo(left + radius, top);
        ctx.lineTo(left + width - radius, top);
        ctx.arcTo(left + width, top, left + width, top + radius, radius);
        ctx.lineTo(left + width, top + height - radius);
        ctx.arcTo(left + width, top + height, left + width - radius, top + height, radius);
        ctx.lineTo(left + radius, top + height);
        ctx.arcTo(left, top + height, left, top + height - radius, radius);
        ctx.lineTo(left, top + radius);
        ctx.arcTo(left, top, left + radius, top, radius);
        ctx.stroke();
        ctx.fill()

        ctx.lineWidth = z/25;
        ctx.beginPath();
        ctx.lineTo((-a + x + 0.5) * z, (b + y + .3) * z);
        ctx.lineTo((-a + x + 0.5) * z, (b + y + .4) * z);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc((-a + x + 0.5)* z, (b + y + 0.65) * z, .06*z, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.lineTo((-a + x + 0.5) * z, (b + y + 0) * z);
        ctx.lineTo((-a + x + 0.5) * z, (b + y + .2) * z);
        ctx.stroke();
    }
}


class Led extends Generic{
    constructor(x,y,r,id) {
        super(x,y,r,id);
    }

    type = 'non-interactive'
    img = 'led'
    nodes = ['input']
    color = '#FF0000'

    offset = {
        input: { x: 0, y: -0.5 },
    }

    get state () {
        let wire = wires.find(o => o.id === this.input.connection);

        if ( wire !== undefined ) {
            if (wire.state) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    shape (x1, y1, a, b) {
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = z/15;
        ctx.setLineDash([]);
    
        ctx.beginPath();
        ctx.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .10 * z, 0, 1 * Math.PI, true);
        ctx.lineTo((-a+ x1 + 0.4) * z, (b + y1 + .75) * z);
        ctx.lineTo((-a + x1 + 0.6) * z, (b + y1 + .75) * z);
        ctx.lineTo((-a + x1 + 0.6) * z, (b + y1 + 0.5) * z);
        ctx.stroke();
        ctx.fill();
    
        ctx.lineWidth = z/25;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.lineTo((-a + x1 + 0.5) * z, (b + y1 + .75) * z);
        ctx.lineTo((-a + x1 + 0.5) * z, (b + y1 + 1) * z);
        ctx.stroke();
    }
}

class NandGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('nandgate');
    }
// logical element of the gate
    get state () {
        let wire1 = wires.find(o => o.id === this.input1.connection);
        let wire2 = wires.find(o => o.id === this.input2.connection);

        if (!wire1.state || !wire2.state) {
            return 1;
        } else {
            return 0;
        }
    }

}

class AndGate extends Generic {
    constructor(x,y,r,id) {
        super(x,y,r,id);

        this.image = document.getElementById('andgate');
    }

    get state () {
        let wire1 = wires.find(o => o.id === this.input1.connection);
        let wire2 = wires.find(o => o.id === this.input2.connection);

        if (wire1.state && wire2.state) {
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

    offset = {
        input1: { x: -0.25, y: -0.5 },
        input2: { x: 0.25, y: -0.5 },
        output: { x: 0, y: 0.5 },
    }

    get state () {
        let wire1 = wires.find(o => o.id === this.input1.connection);
        let wire2 = wires.find(o => o.id === this.input2.connection);

        if (wire1.state || wire2.state) {
            return 1;
        } else {
            return 0;
        }
    }
}


// gets list of nodes and adds nodes to gate
function defineNodes(id,nodes,object) {
    for (const node of nodes) {
        Object.defineProperty(object, node, {
            value: {
                //changing scope 
                self: objects[id],
                //id of the wire connected to the node
                connection: undefined,
                get x () { return this.self.x + this.self.offset[node].x },
                get y () { return this.self.y + this.self.offset[node].y },
                }
        });
    }

    // addes list of nodes to gate
    Object.defineProperty(object, 'nodes', {
        value: nodes
    });
}















