import { logic } from "../logic";

export type Binary = 0 | 1;
export type Coordinate = { x:number, y:number};

export type GateType = logic.AndGate | logic.NandGate;

export type ComponentType = GateType | logic.Input | logic.Led;

export interface NodePositions {
    [node: string]: Coordinate
}
