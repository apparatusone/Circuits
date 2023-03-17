import { logic } from "../scripts/logic";

describe('Test FullAdder Circuit', () => {
    const circuit = new logic.Simulate();
    const inputOne = new logic.Input();
    const inputTwo = new logic.Input();
    const carryIn = new logic.Input();

    const andGate1 = new logic.AndGate();
    const andGate2 = new logic.AndGate();
    const xorGate1 = new logic.XorGate();
    const xorGate2 = new logic.XorGate();
    const orGate = new logic.OrGate();

    beforeEach(() => {
        circuit.addComponent(inputOne)
        circuit.addComponent(inputTwo)
        circuit.addComponent(carryIn)
        
        circuit.addComponent(andGate1)
        circuit.addComponent(andGate2)
        circuit.addComponent(xorGate1)
        circuit.addComponent(xorGate2)
        circuit.addComponent(orGate)
        
        circuit.addConnection(inputOne, xorGate1, 'inputA')
        circuit.addConnection(inputOne, andGate2, 'inputA')
        
        circuit.addConnection(inputTwo, xorGate1, 'inputB')
        circuit.addConnection(inputTwo, andGate2, 'inputB')
        
        circuit.addConnection(carryIn, xorGate2, 'inputB')
        circuit.addConnection(carryIn, andGate1, 'inputA')
        
        circuit.addConnection(xorGate1, xorGate2, 'inputA')
        circuit.addConnection(xorGate1, andGate1, 'inputB')
        
        circuit.addConnection(andGate1, orGate, 'inputA')
        circuit.addConnection(andGate2, orGate, 'inputB')
    });

    it("should output Sum: 0, Carry Out: 0, when all inputs are 0", () => {
        inputOne.setInput(0);
        inputTwo.setInput(0);
        carryIn.setInput(0);
        circuit.propogate();

        expect(orGate.state).toBe(0); //carry out
        expect(xorGate2.state).toBe(0); //sum
    });

    it("should output Sum: 1, Carry Out: 0, when one input is 1", () => {
        inputOne.setInput(1);
        inputTwo.setInput(0);
        carryIn.setInput(0);
        circuit.propogate();

        expect(orGate.state).toBe(0); //carry out
        expect(xorGate2.state).toBe(1); //sum

        inputOne.setInput(0);
        inputTwo.setInput(1);
        carryIn.setInput(0);
        circuit.propogate();

        expect(orGate.state).toBe(0); //carry out
        expect(xorGate2.state).toBe(1); //sum

        inputOne.setInput(0);
        inputTwo.setInput(0);
        carryIn.setInput(1);
        circuit.propogate();

        expect(orGate.state).toBe(0); //carry out
        expect(xorGate2.state).toBe(1); //sum
    });

    it("should output Sum: 0, Carry Out: 1, when two input are 1", () => {
        inputOne.setInput(1);
        inputTwo.setInput(1);
        carryIn.setInput(0);
        circuit.propogate();

        expect(orGate.state).toBe(1); //carry out
        expect(xorGate2.state).toBe(0); //sum

        inputOne.setInput(0);
        inputTwo.setInput(1);
        carryIn.setInput(1);
        circuit.propogate();

        expect(orGate.state).toBe(1); //carry out
        expect(xorGate2.state).toBe(0); //sum

        inputOne.setInput(1);
        inputTwo.setInput(0);
        carryIn.setInput(1);
        circuit.propogate();

        expect(orGate.state).toBe(1); //carry out
        expect(xorGate2.state).toBe(0); //sum
    });

    it("should output Sum: 1, Carry Out: 1, when all input are 1", () => {
        inputOne.setInput(1);
        inputTwo.setInput(1);
        carryIn.setInput(1);
        circuit.propogate();

        expect(orGate.state).toBe(1); //carry out
        expect(xorGate2.state).toBe(1); //sum
    });
});