import * as Type from './types/types'
import { easeOutBounce, rotateCoordinate } from './utilites'

export namespace logic {
    export class Simulate {
        components:Map<number, Type.ComponentType>
        connections:Map<number, Set<Type.NodeConnection>>
        connectionCoordinates:Array<{a:Type.Coordinate, b:Type.Coordinate}>;

        constructor() {
            this.components = new Map();
            this.connections = new Map();
            this.connectionCoordinates = [];
        }

        addComponent(component: Type.ComponentType) {
            const id:number = this.components.size;
            this.components.set(id, component);
            component.id = id;
        }

        // creates connections in the connection map, takes source id, target id and node name.
        addConnection(source:Type.ComponentType, sourceNode:string, target:Type.ComponentType, targetNode:string) {
            // check if components are in map
            if (!this.components.get(source.id)) {
                throw new Error(`${source.constructor.name} does not exist in Components map.`);
            }
            if (!this.components.get(target.id)) {
                throw new Error(`${target.constructor.name} does not exist in Components map.`);
            }

            // check if drawing to same component
            if (source === target) {
                throw new Error(`Drawing to the same component is not allowed`);
            }

            // switch source and target if drawing from an input to an output
            if (sourceNode.includes('input')) {
                [source, target] = [target, source];
                [sourceNode, targetNode] = [targetNode, sourceNode];
            }

            if (!this.connections.has(source.id)) {
                // create a new key value pair with a set as the value
                this.connections.set(source.id, new Set());
                // add target to the set
                this.connections.get(source.id).add([source.id, sourceNode, target.id, targetNode]);
            } else {
                this.connections.get(source.id).add([source.id, sourceNode, target.id, targetNode]);
            }
            this.updateCoordinates();
        }

        // updates the connection coordinates array
        updateCoordinates() {
            // clear coordinates array
            this.connectionCoordinates = []
            for (const [key, set] of this.connections) {
                const component_a = this.components.get(key);

                set.forEach( ([sourceId, sourceNode, objectId, targetNode]:Type.NodeConnection) => {
                    const node_a = component_a.nodes[sourceNode];
                    const rotate_a = rotateCoordinate( {x:node_a.x, y:node_a.y}, component_a.r)
                    const coordinate_a = {
                        x: component_a.x - rotate_a.x,
                        y: component_a.y + rotate_a.y,
                    }
                    const component_b = this.components.get(objectId)
                    const node_b = component_b.nodes[targetNode]
                    const rotate_b = rotateCoordinate( {x:node_b.x, y:node_b.y}, component_b.r)

                    const coordinate_b = {
                        x: component_b.x + rotate_b.x,
                        y: component_b.y + rotate_b.y,
                    }

                    this.connectionCoordinates.push({a:coordinate_a, b:coordinate_b});
                });
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
                const currentId: number | undefined = queue.shift();
                if (currentId === undefined) return

                const current = this.components.get(currentId);
                if (current === undefined) return
                visited.add(currentId);

                // Compute the output of the current component
                // get connections of current component and store in an array
                let currentConnections:Array<Type.NodeConnection> = [];

                if (this.connections.get(currentId)) {
                    currentConnections = [...this.connections.get(currentId)]
                }

                if (currentConnections.length) {
                    const visitedNodes = new Set
                    for (let [index, connection] of currentConnections.entries()) {
                        const [id_a, node_a, id_b, node_b]:Type.NodeConnection = connection;
                        const component = this.components.get(id_b) as Type.GateType

                        if (component === undefined) return

                        // get all inputs for the target node
                        // FIXME: this is probably not the most efficient solution
                        // another potential option is to store visited nodes as a string: `${id_id}_$node_b}`
                        // and only update them if the new state is 1
                        const state = this._findArrayWithNumber(this.connections, id_b, node_b, visitedNodes )

                        // set value of node
                        component.setInput(node_b, state)
                        // update component
                        component.logic();
                        
                        // FIXME: this will need to be changed
                        // add component to the queue if it hasn't been visited
                        if (!visited.has(id_b)) {
                            queue.push(id_b);
                        }
                    }
                }
            }
        }

        // get all inputs connected to a particular node
        private _findArrayWithNumber( map:any, id:number, node:any, set:any ):Type.Binary {
            const bits:Array<Type.Binary> = [];
          
            map.forEach((value:Set<Type.NodeConnection>, key:Type.NodeConnection) => {
                for (const array of value) {
                    if (array[2] === id && array[3] === node) {
                        const component = this.components.get(array[0]);
                        const state = component.state;
                        bits.push(state);
                        break;
                    }
                }
            });
          
            // returns 1 if any number is 1 (or), else 0
            return bits.some(bit => bit) ? 1 : 0 as Type.Binary;
        }
    }

    class Generic {
        state: Type.Binary;
        id: number | null;
        inputNodeList: Array<string>;
        nodes: Type.NodePositions
        [key: string]: any;

        constructor(x = 0, y = 0, r = 0, inCount:number = 2, outCount:number = 1) {
            this.state = 0;
            this.id = null;
            this.x = x;
            this.y = y;
            this.r = r;
            this.inputNodeList = [];

            this.nodes = Object.assign(
                {},
                inCount ? genNodePositions(inCount, "input", this) : {},
                outCount ? genNodePositions(outCount, "output", this) : {}
            );

            this.prevPosition = {x: 0, y: 0};
        }

        setInput(inputName: string, state: Type.Binary) {
            this[inputName] = state;
        }

        getState() {
            return this.logic();
        }
    }

    export class Input extends Generic {
        constructor(x: number, y: number, r = 0, inCount = 0, outCount = 1) {
            super(x, y, r, inCount, outCount);
            this.switchPosition = 1;
            this.name = "input";
        }

        setOutput(value:Type.Binary) {
            this.state = value;
            this._animate();
        }

        getState() {
            return this.state;
        }

        private _timeoutID: ReturnType<typeof setTimeout> | undefined = undefined;
        private _animate():void {
            const self = this;
            let i = 0;
            const increments = 80;
            const speed = 4;
    
            // if button is clicked before previous animation ends
            if (self._timeoutID !== undefined) {
                clearTimeout(self._timeoutID)
                self.switchPosition = self.state
            }
    
            iterate()
            //animate state change
            function iterate () {
                self._timeoutID = setTimeout(function() {
                    if (self.state) self.switchPosition = 1 - easeOutBounce(i/increments)
                    if (!self.state) self.switchPosition = easeOutBounce(i/increments)
                i++
                if (i < increments) {        
                    iterate();
                }           
                if (i === increments) {
                    self.switchPosition = 1 - self.state
                    self._timeoutID = undefined
                }
                }, speed)          
            }
        }
    }

    export class AndGate extends Generic {
        name = "andGate";

        logic() {
            // can handle an arbitrary number of inputs
            const newState = this.inputNodeList.every(input => this[input]) ? 1 : 0;
            this.state = newState;
            return this.state
        }
    }

    export class NandGate extends Generic {
        name = "nandGate"

        logic() {
            const newState:unknown = !this.input_a || !this.input_b
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    export class OrGate extends Generic {
        name = 'orGate'

        logic() {
            const newState = this.inputNodeList.some(input => this[input]) ? 1 : 0;
            this.state = newState;
            return this.state
        }
    }

    export class NorGate extends Generic {
        name = 'norGate'

        logic() {
            const newState:unknown = !this.input_a && !this.input_b;
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    export class XorGate extends Generic {
        name = 'xorGate'

        logic() {
            const newState = this.input_a ^ this.input_b;
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    export class XnorGate extends Generic {
        name = 'xnorGate'

        logic() {
            const newState:unknown = !(this.input_a ^ this.input_b);
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    export class NotGate extends Generic{
        constructor(x: number, y: number, r = 0, inCount = 1, outCount = 1) {
            super(x, y, r, inCount, outCount);
            this.name = "notGate";
        }

        logic() {
            const newState:unknown = !(this.input_a);
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    export class Led extends Generic {
        constructor(x: number, y: number, r = 0, inCount = 1, outCount = 0) {
            super(x, y, r, inCount, outCount);
            this.name = 'led';
        }

        setInput(inputName: string, state: Type.Binary) {
            this[inputName] = state;
        }

        logic() {
            this.state = this.input_a;
            return this.state
        }
    }

    export class Multiplexor extends Generic {
        constructor(x: number, y: number, r = 0, inCount = 3, outCount = 1) {
            super(x, y, r, inCount, outCount);
            this.name = 'mux';

            this.inputNodeList = ['input_a','input_b','input_sel'];
            this.nodes = {
                input_a: {x: -.25, y: -0.5},
                input_b: {x: .25, y: -0.5},
                input_sel: {x: 0.5, y: 0},
                output_a: {x: 0, y: 0.5},
            }
        }

        logic() {
            const newState: number = (this.input_a & (~this.input_sel & 1)) | (this.input_b & (this.input_sel & 1));
            this.state = newState as Type.Binary;
            return this.state
        }
    }

    function genNodePositions(n:number, nodeType:"input"|"output", component:Generic) {
        if (n <= 0) return
        if (n > 25) {
            throw new Error(`${n} is out of range.`);
        }

        // place nodes at top or bottom
        let p:number = 1;
        (nodeType === 'output') ? p = p : p = -p

        const nodes = {} as Record<string, any>

        const positions = {
            1: { 0: { x: 0, y: p * 0.5 }},
            2: { 0: { x: -0.25, y: p * 0.5 },
                 1: { x: 0.25, y: p * 0.5 }},
            3: { 0: { x: -0.25, y: p * 0.5 },
                 1: { x: 0, y: p * 0.5 },
                 2: { x: 0.25, y: p * 0.5 }}
        } as Record<string, any> ;

        for (let i = 0; i < n; i++) {
            const char = String.fromCharCode(97 + i);
            const name = `${nodeType}_${char}`;
            
            // add node to component
            component[name] = 0;
            if (nodeType === 'input') component.inputNodeList.push(name);
            nodes[name] = positions[n][i];
        }

        return nodes
    }
};

