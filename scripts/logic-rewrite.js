class DigitalCircuit {
    constructor() {
        this.components = new Map();
        this.connections = new Map();
    }

    addComponent(component) {
        let id = this.components.size;
        this.components.set(id, component);
        component.id = id;
        return id;
    }

    // creates connections in the connection map, takes source id, target id and node name.
    addConnection(source, target, node) {
        const output = this.components.get(source);
        const input = this.components.get(target);
        if (!output) {
            throw new Error(`Output component with ID ${output} does not exist.`);
        }
        if (!input) {
            throw new Error(`Input component with ID ${input} does not exist.`);
        }

        if (!this.connections.has(source)) {
            // create a new key value pair with a set as the value
            this.connections.set(source, new Set());
            // add target to the set
            this.connections.get(source).add([target, node]);
        } else {
            this.connections.get(source).add([target, node]);
        }
    }
    
    setInput(inputIndex, state) {
        let input = this.components.get(inputIndex);
        input.setInput(state);
        this.bfs();
    }

    run() {
        let queue = [];
        let visited = new Set();
    
        // Add all inputs to the queue
        for (let [id, ele] of this.components) {
            if (ele.constructor === Input) {
                queue.push(id);
            }
        }
    
        // Traverse the circuit using BFS
        while (queue.length > 0) {
            let currentId = queue.shift();
            let current = this.components.get(currentId);
            visited.add(currentId);

            // Compute the output of the current component
            // get connections of current component and store in an array
            let currentConnections;
            if (this.connections.get(currentId)) {
                currentConnections = [...this.connections.get(currentId)]
            }

            if (currentConnections) {
                for (let [index, connection] of currentConnections.entries()) {
                    const [id, node] = connection
                    const component = this.components.get(id)

                    // set value of node
                    component.setInput(node,current.state)

                    // update component
                    component.logic();
                    
                    // FIXME: this will need to be changed
                    // add component to the queue if it hasn't been visited
                    if (!visited.has(id)) {
                        queue.push(id);
                    }
                }
            }
        }
    }
    
}

class Input {
    constructor(id) {
        this.state = 0;
        this.id = id;
    }

    setInput(state) {
        this.state = state;
    }

    getState() {
        return this.state;
    }
}


class Node {
    constructor(id) {
        this.state = 0;
        this.id = id;
    }

    setInput(state) {
        this.state = state;
    }

    getState() {
        return this.state;
    }
}


class Output {
    constructor(id) {
        this.connections = [];
        this.state = undefined;
        this.id = id;
    }

    computeOutput() {
        if (this.connections.length === 0) {
            throw new Error("Output component is not connected to any input.");
        }
        let input = this.connections[0];
        let state = input.getOutput();
        this.state = state;
        return state;
    }
    

    getState() {
        return this.state;
    }
}


class AndGate {
    constructor(id) {
        this.inputA = null;
        this.inputB = null;
        this.state = null;
        this.id = id;
    }

    setInput(inputName, state) {
        this[inputName] = state
    }

    logic() {
        const newState = this.inputA && this.inputB;
        this.state = newState;
        return this.state
    }

    getState() {
        return this.logic();
    }
}

class XorGate {
    constructor(id) {
        this.inputA = null;
        this.inputB = null;
        this.state = null;
        this.id = id;
    }

    setInput(inputName, state) {
        this[inputName] = state
    }

    logic() {
        const newState = this.inputA * !this.inputB + !this.inputA * this.inputB
        this.state = newState;
        return this.state
    }

    getState() {
        return this.logic();
    }
}

const circuit = new DigitalCircuit();

const inputOne = new Input();
inputOne.setInput(1);
const inputTwo = new Input();
inputTwo.setInput(1);

const andGate = new AndGate();
const xorGate = new XorGate();

circuit.addComponent(inputOne);
circuit.addComponent(inputTwo);
circuit.addComponent(andGate);
circuit.addComponent(xorGate);

circuit.addConnection(inputOne.id, andGate.id, 'inputA')
circuit.addConnection(inputTwo.id, andGate.id, 'inputB')

circuit.addConnection(inputOne.id, xorGate.id, 'inputA')
circuit.addConnection(inputTwo.id, xorGate.id, 'inputB')

circuit.run();

console.log('carry', andGate.state);
console.log('sum', xorGate.state);

