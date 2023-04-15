import { Logic } from "../logic";

export type Binary = 0 | 1;
export type Coordinate = { x:number, y:number};

export type GateType = InstanceType<typeof Logic.AndGate> | InstanceType<typeof Logic.NandGate>;

export type ComponentType = GateType | InstanceType<typeof Logic.Input> | InstanceType<typeof Logic.Led>;

export type NodeConnection = [ number, string, number, string ];

export interface NodePositions {
    [node: string]: Coordinate
}
  
