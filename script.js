//Transistor

let inputVoltage = 1;
let outputVoltage = 0;
//let base = 0;
const On = "On"
const Off = "Off"
let transistorCount = 0;
let andCount = 0;

//operated by switching the voltage on the base
//collector is circuit voltage
//base is Vin
//emitter is ground
// NPN transistor

// transistor constructor function
function Transistor(collector, base, emitter, id) {
    this.collector = collector;
    this.base = base;
    this.emitter = emitter;
    this.id = id;
    this.logic = function() {if (this.base === 1 && this.collector === 1) 
                                {this.emitter = 1;
                                } else {this.emitter = 0}}
}

//function to create a new transistor with a unique iterated name
function makeTransistor(x) {
    for (let i = 0; i < x; i++) {
        transistor = new Transistor(0, 0, 0, transistorCount);
        transistorCount++;
        return transistor;
    }
}

function NotGate(input1, output, id) {
    this.input1 = input1;
    this.output = output;
    this.id = id;
    this.logic = function() {if (this.base === 1 && this.collector === 1) {
                                    this.output = 0;
                                } else {
                                    this.output = 1}}
}

function makeNotGate(x) {
    for (let i = 0; i < x; i++) {
        window[`notGate`] = new NotGate(makeTransistor(1), 0, transistorCount);
        return window[`notGate`];
    }
}

//AND gate 2x NPN transistors
// 2 inputs 1 output

function AndGate(input1, input2, transistor1, transistor2, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.transistor1 = transistor1;
    this.transistor2 = transistor2;
    this.output = output;
    this.id = id;
    this.logic = function() {
        this.transistor1.collector = 1;
        this.transistor1.base = this.input1;
        this.transistor2.base = this.input2;
        this.transistor1.logic();
        this.transistor2.collector = this.transistor1.emitter;
        this.transistor2.logic();
        if (this.transistor2.emitter === 1) {
            this.output = 1;
        } else {
            this.output = 0;
        }
    };
}

function makeAndGate() {
        andGate = new AndGate(0, 0, makeTransistor(1), makeTransistor(1), 0, andCount);
        andCount++;
        return andGate;
}

// OR gate

function OrGate(input1, input2, transistor1, transistor2, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.transistor1 = transistor1;
    this.transistor2 = transistor2;
    this.output = output;
    this.id = id;
    this.logic = function() {
        this.transistor1.collector = 1;
        this.transistor1.base = this.input1;
        this.transistor2.collector = 1;
        this.transistor2.base = this.input2;
        this.transistor1.logic();
        this.transistor2.logic();
        if (this.transistor1.emitter === 1 || this.transistor2.emitter === 1) {
            this.output = 1;
        } else {
            this.output = 0;
        }
    };
}

function makeOrGate(x) {
    let orId = []
    for (let i = 0; i < x; i++) {
        window[`orGate`] = new OrGate(1, 1, makeTransistor(1), makeTransistor(1), 0, andCount);
        return window[`orGate`];
    }
}

// NOR gate

function NorGate(input1, input2, transistor1, transistor2, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.transistor1 = transistor1;
    this.transistor2 = transistor2;
    this.output = output;
    this.id = id;
    this.logic = function() {
        this.transistor1.collector = 1;
        this.transistor1.base = this.input1;
        this.transistor2.collector = 1;
        this.transistor2.base = this.input2;
        this.transistor1.logic();
        this.transistor2.logic();
        if (this.transistor1.emitter === 1 || this.transistor2.emitter === 1) {
            this.output = 0;
        } else {
            this.output = 1;
        }
    };
}

function makeNorGate(x) {
    let orId = []
    for (let i = 0; i < x; i++) {
        window[`norGate`] = new NorGate(0, 0, makeTransistor(1), makeTransistor(1), 0, andCount);
        andCount++;
        return window[`norGate`];
    }
}

//NAND gate

function NandGate(input1, input2, transistor1, transistor2, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.transistor1 = transistor1;
    this.transistor2 = transistor2;
    this.output = output;
    this.id = id;
    this.logic = function() {
        this.transistor1.collector = 1;
        this.transistor1.base = this.input1;
        this.transistor2.base = this.input2;
        this.transistor1.logic();
        this.transistor2.collector = this.transistor1.emitter;
        this.transistor2.logic();
        if (this.transistor2.emitter === 1) {
            this.output = 0;
        } else {
            this.output = 1;
        }
    };
}

function makeNandGate(x) {
    let andId = []
    for (let i = 0; i < x; i++) {
        window[`nandGate`] = new NandGate(0, 0, makeTransistor(1), makeTransistor(1), 1, andCount);
        return window[`nandGate`];
    }
}

// XOR gate

function XorGate(input1, input2, nandGate, andGate, orGate, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.nandGate = nandGate;
    this.andGate = andGate;
    this.orGate = orGate;
    this.output = output;
    this.id = id;
    this.logic = function() {
        this.nandGate.input1 = this.input1;
        this.nandGate.input2 = this.input2;
        this.nandGate.logic();
        this.orGate.input1 = this.input2;
        this.orGate.input2 = this.input1;
        this.orGate.logic();
        this.andGate.input1 = this.nandGate.output;
        this.andGate.input2 = this.orGate.output;
        this.andGate.logic();
        this.output = this.andGate.output;
    };
}

function makeXorGate(x) {
    let andId = []
    for (let i = 0; i < x; i++) {
        window[`xorGate`] = new XorGate(1, 1, makeNandGate(1), makeAndGate(1), makeOrGate(1), 0, andCount)
        return window[`xorGate`]
        //andCount++;
    }
}

function XnorGate(input1, input2, norGate, andGate, orGate, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.norGate = norGate;
    this.andGate = andGate;
    this.orGate = orGate;
    this.output = output;
    this.id = id;
    this.logic = function() {
        this.norGate.input1 = this.input1;
        this.norGate.input2 = this.input2;
        this.norGate.logic();
        this.andGate.input1 = this.input2;
        this.andGate.input2 = this.input1;
        this.andGate.logic();
        this.orGate.input1 = this.norGate.output;
        this.orGate.input2 = this.andGate.output;
        this.orGate.logic();
        this.output = this.orGate.output;
    };
}

function makeXnorGate(x) {
    for (let i = 0; i < x; i++) {
        window[`xnorGate`] = new XnorGate(0, 0, makeNorGate(1), makeAndGate(1), makeOrGate(1), 0, andCount);
        return window[`xnorGate`]
        //andCount++;
    }
}


function HalfAdder(x, y, xorGate, andGate, sum, carryOut) {
    this.x = x;
    this.y = y;
    this.xorGate = xorGate;
    this.andGate = andGate;
    this.sum = sum;
    this.carryOut = carryOut;
    this.logic = function() {
        this.xorGate.input1 = this.x;
        this.xorGate.input2 = this.y;
        this.andGate.input1 = this.x;
        this.andGate.input2 = this.y;
        xorGate.logic();
        andGate.logic();
        this.sum = this.xorGate.output;
        this.carryOut = this.andGate.output;
    };
}

function makeHalfAdder() {
    window[`halfAdder`] = new HalfAdder(0, 0, makeXorGate(1), makeAndGate(1));
    return window[`halfAdder`]
}

function FullAdder(a, b, carryIn, halfAdder1, halfAdder2, orGate, sum, carryOut) {
    this.a = a;
    this.b = b;
    this.carryIn = carryIn;
    this.halfAdder1 = halfAdder1;
    this.halfAdder2 = halfAdder2;
    this.orGate = orGate;
    this.sum = sum;
    this.carryOut = carryOut;
    this.logic = function() {
        this.halfAdder1.x = a;
        this.halfAdder1.y = b;
        halfAdder1.logic();
        this.halfAdder2.x = this.halfAdder1.sum;
        this.halfAdder2.y = this.carryIn;
        halfAdder2.logic();
        this.orGate.input1 = halfAdder1.carryOut;
        this.orGate.input2 = halfAdder2.carryOut;
        orGate.logic();
        this.carryOut = orGate.output;
        this.sum = halfAdder2.sum;
    }
}

function makeFullAdder() {
    window[`fullAdder`] = new FullAdder(0, 0, 0, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    return window[`fullAdder`]
}

//simple calculator
let firstNumber = [0, 0, 0, 1]
let secondNumber = [0, 1, 0, 0]

let addOne = new HalfAdder(firstNumber[3], secondNumber[3], makeXorGate(1), makeAndGate(1));
addOne.logic();

let addTwo = new FullAdder(firstNumber[2], secondNumber[2], addOne.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
addTwo.logic();

let addThree = new FullAdder(firstNumber[1], secondNumber[1], addTwo.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
addThree.logic();

let addFour = new FullAdder(firstNumber[0], secondNumber[0], addThree.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
addFour.logic();

let calOutput = [addFour.sum, addThree.sum, addTwo.sum, addOne.sum]
console.log(calOutput)


// let collector1 = document.getElementById('collector1');
// andGate.input1.collector = 1;
// collector1.textContent = andGate.input1.collector;

// function updateDom() {
//     for (let i = 1; i < transistorCount + 1; i++) {
//         //console.log(i);
//         eval(`collector${i}.textContent` + "=" + `andGate.input${i}.collector`);
//         eval(`base${i}.textContent` + "=" + `andGate.input${i}.base`);
//         eval(`emitter${i}.textContent` + "=" + `andGate.input${i}.emitter`);
//     }
// };

// for (let i = 1; i < transistorCount.length + 1; i ++){
//     let 
// }


// let emitter1 = document.getElementById('emitter1');
// emitter1.textContent = andGate.input1.emitter;

// let base1 = document.getElementById('base1');
// base1.textContent = andGate.input1.base;

// let collector2 = document.getElementById('collector2');
// collector2.textContent = andGate.input1.collector;

// let emitter2 = document.getElementById('emitter2');
// emitter2.textContent = andGate.input1.emitter;

// let base2 = document.getElementById('base2');
// base2.textContent = andGate.input1.base;

// let button1 = document.getElementById("one");
// let button2 = document.getElementById("two");


// button1.onclick = function() {
//     if (button1.textContent === On) {
//         button1.textContent = Off;
//         andGate.input1.base = 0;
//     } else if (button1.textContent === Off) {
//         button1.textContent = On;
//         andGate.input1.base = 1;
//     }
//     base1.textContent = andGate.input1.base;
//     andGate.input1.logic();
//     andGate.logic();
//     emitter1.textContent = andGate.input1.emitter;
//     updateDom();
// }

// button2.onclick = function() {
//     if (button2.textContent === On) {
//         button2.textContent = Off;
//         andGate.input2.base = 0;

//     } else if (button2.textContent === Off) {
//         button2.textContent = On;
//         andGate.input2.base = 1;
//     }
//     base2.textContent = transistor2.base;
//     andGate.logic();
//     emitter2.textContent = andGate.input2.emitter;
//     updateDom();
// }
