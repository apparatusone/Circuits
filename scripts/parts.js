class Box {
    constructor(x,y,r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.highlight = false;  
        this.input1;
        this.input2;
        this.output1;
        this.nodes;
        this.image = document.getElementById('testbox');
    }

    nodes = {
        input1: { x: -0.25, y: 0, value:0 },
        input2: { x: 0.25, y: 0, value:0 },
        output1: { x: 0, y: -0.25, value:0 },
    };

    rotateNodes(dir) {
        for (let ele in this.nodes) {
            let a = this.nodes[ele].x
            let b = this.nodes[ele].y
            if (dir === 'right') [a, b] = [-b, a];
            if (dir === 'left') [a, b] = [b, -a];
            this.nodes[ele].x = a
            this.nodes[ele].y = b
        }
    }

    gridCoordinatesX() {
        return (-origin.x + this.x) * z
    }
    gridCoordinatesY() {
        return (origin.y - this.y) * z
    }
}

class Wire {
    constructor(index1, node1, x1, y1) {
        this.index1 = index1;
        this.index2 = index1;
        this.node1 = node1;
        this.node2 = node1;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x1;
        this.y2 = y1;
    }

    locateWires() {
        this.x1 = (objects[this.index1].x + objects[this.index1].nodes[this.node1].x) ;
        this.y1 = (objects[this.index1].y - objects[this.index1].nodes[this.node1].y) ;
        if (this.index1 !== this.index2) {
            this.x2 = (objects[this.index2].x + objects[this.index2].nodes[this.node2].x) ;
            this.y2 = (objects[this.index2].y - objects[this.index2].nodes[this.node2].y)
        };
    }
}

class OnOff {
    constructor(x,y,r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.output;
        this.image = document.getElementById('onoff');
    }

    rotateNodes(dir) {
        for (let ele in this.nodes) {
            let a = this.nodes[ele].x
            let b = this.nodes[ele].y
            if (dir === 'right') [a, b] = [-b, a];
            if (dir === 'left') [a, b] = [b, -a];
            this.nodes[ele].x = a
            this.nodes[ele].y = b
        }
    }

    gridCoordinatesX() {
        return (-origin.x + this.x) * z
    }
    gridCoordinatesY() {
        return (origin.y - this.y) * z
    }
}


