//Transistor

let inputVoltage = 1;
let outputVoltage = 0;
//let base = 0;
const On = "On"
const Off = "Off"
let transArray = [];
let transistorCount = 0;

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
    let transId = [];
    for (let i = 0; i < x; i++) {
        transistorCount++;
        window["transistor"+transistorCount] = new Transistor(0, 0, 0, transistorCount);
        
        transId.push(transistorCount);
    }
    return transId; //id for the specific transistor generated
}

//AND gate 2x NPN transistors
// 2 inputs 1 output

const andGate = new Object();
andGate.input1 = 0;
andGate.input2 = 0;
andGate.output = 0;
andGate.create = function() { 
    let array = makeTransistor(2)
    andGate.array = array;
}
andGate.logic = function() {
                    transistor1.logic();
                    let emitter = eval(`transistor${andGate.array[0]}.emitter`) //get transistor1.emitter state
                    eval(`transistor${andGate.array[1]}.collector` + "=" + emitter); //set transistor2.collector state
                    transistor2.logic();

                    //console.log(eval(`transistor${andGate.array[0]}.collector`))  //spent 2 hours researching an alternative to eval
                };

andGate.create();

const orGate = new Object();
orGate.input1 = 0;
orGate.input2 = 0;
orGate.output = 0;
orGate.create = function() { 
    let array = makeTransistor(2)
    orGate.array = array;
}
orGate.logic = function() {

};




let collector1 = document.getElementById('collector1');
transistor1.collector = 1;
collector1.textContent = transistor1.collector;

function updateDom() {
    for (let i = 1; i < transistorCount + 1; i++) {
        console.log(i);
        eval(`collector${i}.textContent` + "=" + `transistor${i}.collector`);
        eval(`base${i}.textContent` + "=" + `transistor${i}.base`);
        eval(`emitter${i}.textContent` + "=" + `transistor${i}.emitter`);
    }
};

// for (let i = 1; i < transistorCount.length + 1; i ++){
//     let 
// }
let emitter1 = document.getElementById('emitter1');
emitter1.textContent = transistor1.emitter;

let base1 = document.getElementById('base1');
base1.textContent = transistor1.base;

let collector2 = document.getElementById('collector2');
collector2.textContent = transistor2.collector;

let emitter2 = document.getElementById('emitter2');
emitter2.textContent = transistor2.emitter;

let base2 = document.getElementById('base2');
base2.textContent = transistor2.base;

let button1 = document.getElementById("one");
let button2 = document.getElementById("two");


button1.onclick = function() {
    if (button1.textContent === On) {
        button1.textContent = Off;
        transistor1.base = 0;
    } else if (button1.textContent === Off) {
        button1.textContent = On;
        transistor1.base = 1;
    }
    base1.textContent = transistor1.base;
    transistor1.logic();
    andGate.logic();
    emitter1.textContent = transistor1.emitter;
    updateDom();
}

button2.onclick = function() {
    if (button2.textContent === On) {
        button2.textContent = Off;
        transistor2.base = 0;

    } else if (button2.textContent === Off) {
        button2.textContent = On;
        transistor2.base = 1;
    }
    base2.textContent = transistor2.base;
    andGate.logic();
    emitter2.textContent = transistor2.emitter;
    updateDom();
}
