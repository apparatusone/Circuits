export type Binary = 0 | 1;

export interface Gate {
    inputA: Binary;
    inputB: Binary;
    state: Binary;
    id: number | null;
}