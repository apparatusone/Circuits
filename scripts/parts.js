class Box {
    constructor(x,y,r) {
        this.image = document.getElementById('testbox');
        this.x = x;
        this.y = y;
        this.r = r;
        this.highlight = false;  
        this.input1;
        this.input2;
        this.output1;
        this.nodes;
    }

    nodes = [
        this.input1 = {location: {x: -0.25,y: 0}, value:0},
        this.input2 = {location: {x: 0.25,y: 0}, value:0},
        this.output1 = {location: {x: 0,y: -0.25}, value:0}
    ]

    rotateNodes(dir) {
        for (let ele in this.nodes) {
            let a = this.nodes[ele].location.x
            let b = this.nodes[ele].location.y
            if (dir === 'right') [a, b] = [-b, a];
            if (dir === 'left') [a, b] = [b, -a];
            this.nodes[ele].location.x = a
            this.nodes[ele].location.y = b
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
    constructor(componentIndex, node, x2, y2) {
        this.componentIndex = componentIndex;
        //this.node = node;
        //this.start = objects[0].input1.location;
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
    }

    locateWires() {
        this.x1 = (objects[0].x + objects[0].input1.location.x) ;
        this.y1 = (objects[0].y + objects[0].input1.location.y) ;

        this.x2 = (objects[1].x + objects[1].input1.location.x) ;
        this.y2 = (objects[1].y + objects[1].input1.location.y) ;
    }
}
