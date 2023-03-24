import * as Type from './types/types'

export namespace logic {
    type GateType = AndGate | XorGate
    type ComponentType = GateType | Input | Led

    export class Simulate {
        components:Map<number, ComponentType>
        connections:any

        constructor() {
            this.components = new Map();
            this.connections = new Map();
        }

        addComponent(component: ComponentType) {
            const id = this.components.size;
            this.components.set(id, component);
            component.id = id;
        }

        // creates connections in the connection map, takes source id, target id and node name.
        addConnection(source:any, target:any, node:string) {
            // check if components are in map
            if (!this.components.get(source.id)) {
                throw new Error(`${source.constructor.name} does not exist in Components map.`);
            }
            if (!this.components.get(target.id)) {
                throw new Error(`${target.constructor.name} does not exist in Components map.`);
            }

            if (!this.connections.has(source.id)) {
                // create a new key value pair with a set as the value
                this.connections.set(source.id, new Set());
                // add target to the set
                this.connections.get(source.id).add([target.id, node]);
            } else {
                this.connections.get(source.id).add([target.id, node]);
            }
        }

        propogate() {
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
                const currentId:number|undefined = queue.shift();
                if (currentId === undefined) return

                const current = this.components.get(currentId);
                if (current === undefined) return
                visited.add(currentId);

                // Compute the output of the current component
                // get connections of current component and store in an array
                let currentConnections;

                if (this.connections.get(currentId)) {
                    currentConnections = [...this.connections.get(currentId)]
                }

                if (currentConnections) {
                    for (let [index, connection] of currentConnections.entries()) {
                        const [id, node]:[number, string] = connection;
                        const component = this.components.get(id) as GateType
                        if (component === undefined) return

                        // set value of node
                        component.setInput(node, current.state)
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

    // class Node {
    //     constructor(id) {
    //         this.state = 0;
    //         this.id = id;
    //     }

    //     setInput(state) {
    //         this.state = state;
    //     }

    //     getState() {
    //         return this.state;
    //     }
    // }


    // class Output {
    //     constructor(id) {
    //         this.connections = [];
    //         this.state = undefined;
    //         this.id = id;
    //     }

    //     computeOutput() {
    //         if (this.connections.length === 0) {
    //             throw new Error("Output component is not connected to any input.");
    //         }
    //         let input = this.connections[0];
    //         let state = input.getOutput();
    //         this.state = state;
    //         return state;
    //     }
        

    //     getState() {
    //         return this.state;
    //     }
    // }

    class Generic {
        state: Type.Binary;
        id: number | null;
        [key: string]: any;

        constructor(x:number = 0, y:number = 0, r:number = 0) {
            this.state = 0;
            this.id = null;
            this.x = x;
            this.y = y;
            this.r = r;
        }

        setInput(inputName: string, state: Type.Binary) {
            this[inputName] = state;
        }

        getState() {
            return this.logic();
        }
    }

    class Input {
        state: Type.Binary;
        id: number | null;
        x: number;
        y: number;
        r: number;

        constructor(x = 0, y = 0, r = 0) {
            this.state = 0;
            this.id = null;
            this.x = x;
            this.y = y;
            this.r = r;
        }

        setInput(value:Type.Binary) {
            this.state = value;
        }

        getState() {
            return this.state;
        }
    }

    export class AndGate extends Generic {
        inputA: Type.Binary;
        inputB: Type.Binary;

        constructor(x:number = 0, y:number = 0) {
            super(x, y);
            this.inputA = 0;
            this.inputB = 0;
            this.prevPosition = {x: 0, y: 0};
        }

        logic() {
            const newState = this.inputA && this.inputB;
            this.state = newState;
            return this.state
        }
    }

    class NandGate extends Generic {
        inputA: Type.Binary;
        inputB: Type.Binary;

        constructor() {
            super();
            this.inputA = 0;
            this.inputB = 0;
        }

        logic() {
            const newState:unknown = !this.inputA || !this.inputB
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    class OrGate extends Generic {
        inputA: Type.Binary;
        inputB: Type.Binary;

        constructor() {
            super();
            this.inputA = 0;
            this.inputB = 0;
        }

        logic() {
            const newState = this.inputA || this.inputB;
            this.state = newState;
            return this.state
        }
    }

    class NorGate extends Generic {
        inputA: Type.Binary;
        inputB: Type.Binary;

        constructor() {
            super();
            this.inputA = 0;
            this.inputB = 0;
        }

        logic() {
            const newState:unknown = !this.inputA && !this.inputB;
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    class XorGate extends Generic {
        inputA: Type.Binary;
        inputB: Type.Binary;

        constructor() {
            super();
            this.inputA = 0;
            this.inputB = 0;
        }

        logic() {
            const newState = this.inputA ^ this.inputB;
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    class XnorGate extends Generic {
        inputA: Type.Binary;
        inputB: Type.Binary;

        constructor() {
            super();
            this.inputA = 0;
            this.inputB = 0;
        }

        logic() {
            const newState:unknown = !(this.inputA ^ this.inputB);
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    class NotGate {
        state: Type.Binary;
        id: number | null;
        input: Type.Binary;
        x: number;
        y: number;
        r: number;

        constructor(x = 0, y = 0, r = 0) {
            this.state = 0;
            this.id = null;
            this.input = 0
            this.x = x;
            this.y = y;
            this.r = r;
        }

        logic() {
            const newState:unknown = !(this.input);
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    class Led extends Generic{
        inputA: Type.Binary;

        constructor() {
            super();
            this.inputA = 0;
        }

        // type = 'non-interactive'
        // img = 'led'
        // nodes = ['input']
        // color = "rgba(255,0,0," + .9 + ")"

        // offset = {
        //     input: { x: 0, y: -0.5 },
        // }

        logic() {
            if (this.input.state) {
                return 1;
            } else {
                return 0;
            }
        }

        // shape = shape.led
    }
    // return {
    //     Simulate,
    //     Generic,
    //     Input,
    //     AndGate,
    //     NandGate,
    //     OrGate,
    //     NorGate,
    //     XorGate,
    //     XnorGate,
    //     NotGate,
    // }
}

// export default logic;