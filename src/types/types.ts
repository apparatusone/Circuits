import { logic } from "../logic";

export type Binary = 0 | 1;

export type GateType = logic.AndGate | logic.NandGate

export type ComponentType = GateType