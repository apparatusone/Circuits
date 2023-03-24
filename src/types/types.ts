export type Binary = 0 | 1;

export interface Gate {
    x: number;
    y: number;
    inputA: Binary;
    inputB: Binary;
    state: Binary;
    id: number | null;
}