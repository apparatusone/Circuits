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
    this.logic = function() {if (this.base === 1 && this.collector === 1) 
                                {this.output = 0;
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

// let bandGate = {
//     input1: makeTransistor(1),
//     input2: makeTransistor(1)
// }

function AndGate(input1, input2, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.output = output;
    this.id = id;
    this.logic = function() {
                    this.input1.logic();
                    let emitter = this.input1.emitter;
                    this.input2.collector = emitter;
                    this.input2.logic();
                    if (this.input2.emitter === 1) {
                        this.output = 1;
                    } else {
                        this.output = 0;
                    }
                };
}

function makeAndGate() {
        andGate = new AndGate(makeTransistor(1), makeTransistor(1), 0, andCount);
        andCount++;
        return andGate;
}

// makeAndGate();

// OR gate

function OrGate(input1, input2, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.output = output;
    this.id = id;
    this.logic = function() {
                    this.input1.logic();
                    this.input2.logic();
                    if (this.input1.emitter === 1 || this.input2.emitter === 1) {
                        this.output = 1;
                    } else {
                        this.output = 0;
                    }
                };
}

function makeOrGate(x) {
    let orId = []
    for (let i = 0; i < x; i++) {
        window[`orGate`] = new OrGate(makeTransistor(1), makeTransistor(1), 0, andCount);
        andCount++;
        return window[`orGate`];
    }
}

// NOR gate

function NorGate(input1, input2, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.output = output;
    this.id = id;
    this.logic = function() {
                    this.input1.logic();
                    this.input2.logic();
                    if (this.input1.emitter === 1 || this.input2.emitter === 1) {
                        this.output = 0;
                    } else {
                        this.output = 1;
                    }
                };
}

function makeNorGate(x) {
    let orId = []
    for (let i = 0; i < x; i++) {
        window[`norGate`] = new NorGate(makeTransistor(1), makeTransistor(1), 0, andCount);
        andCount++;
        return window[`norGate`];
    }
}

//NAND gate

function NandGate(input1, input2, output, id) {
    this.input1 = input1;
    this.input2 = input2;
    this.output = output;
    this.id = id;
    this.logic = function() {
                    this.input1.logic();
                    this.input2.collector = this.input1.emitter;
                    this.input2.logic();
                    if (this.input2.emitter === 1) {
                        this.output = 0;
                    } else {
                        this.output = 1;
                    }
                };
}

function makeNandGate(x) {
    let andId = []
    for (let i = 0; i < x; i++) {
        window[`nandGate`] = new NandGate(makeTransistor(1), makeTransistor(1), 1, andCount);
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
                    this.nandGate.input1.collector = 1;
                    this.nandGate.input1.base = this.input1;
                    this.nandGate.input2.base = this.input2;
                    this.nandGate.logic();
                    this.orGate.input1.collector = 1;
                    this.orGate.input2.collector = 1;
                    this.orGate.input1.base = this.input2;
                    this.orGate.input2.base = this.input1;
                    this.orGate.logic();
                    this.andGate.input1.collector = 1;
                    this.andGate.input1.base = this.nandGate.output;
                    this.andGate.input2.base = this.orGate.output;
                    this.andGate.logic();
                    this.output = this.andGate.output;
                };
}

function makeXorGate(x) {
    let andId = []
    for (let i = 0; i < x; i++) {
        window[`xorGate`] = new XorGate(0, 0, makeNandGate(1), makeAndGate(1), makeOrGate(1), 0, andCount)
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
                    this.norGate.input1.collector = 1;
                    this.norGate.input2.collector = 1;
                    this.norGate.input1.base = this.input1;
                    this.norGate.input2.base = this.input2;
                    this.norGate.logic();
                    this.andGate.input1.collector = 1;
                    this.andGate.input1.base = this.input2;
                    this.andGate.input2.base = this.input1;
                    this.andGate.logic();
                    this.orGate.input1.collector = 1;
                    this.orGate.input2.collector = 1;
                    this.orGate.input1.base = this.norGate.output;
                    this.orGate.input2.base = this.andGate.output;
                    this.orGate.logic();
                    this.output = this.orGate.output;
                };
}

function makeXnorGate(x) {
    let andId = []
    for (let i = 0; i < x; i++) {
        window[`xnorGate`] = new XnorGate(1, 1, makeNorGate(1), makeAndGate(1), makeOrGate(1), 0, andCount)
        return window[`xnorGate`]
        //andCount++;
    }
}

makeXnorGate(1);
xnorGate.logic();




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
