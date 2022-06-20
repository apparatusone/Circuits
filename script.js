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
        return transistor;
    }
}

function NotGate(input, output) {
    this.input = input;
    this.output = output;
    this.logic = function() {if (this.input === 1) {
                                    this.output = 0;
                                } else {
                                    this.output = 1}}
}

function makeNotGate(x) {
    for (let i = 0; i < x; i++) {
        window[`notGate`] = new NotGate(0, 0);
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
let firstNumber = [0, 0, 0, 0]
let secondNumber = [0, 0, 0, 0]

function fourBitAdder() {
    let addOne = new HalfAdder(firstNumber[3], secondNumber[3], makeXorGate(1), makeAndGate(1));
    addOne.logic();

    let addTwo = new FullAdder(firstNumber[2], secondNumber[2], addOne.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addTwo.logic();

    let addThree = new FullAdder(firstNumber[1], secondNumber[1], addTwo.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addThree.logic();

    let addFour = new FullAdder(firstNumber[0], secondNumber[0], addThree.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addFour.logic();

    let calOutput = [addFour.carryOut, addFour.sum, addThree.sum, addTwo.sum, addOne.sum]
    return calOutput;
}

//convert binary to decimal
function binaryToDecimal(array) {
    const reversed = [...array].reverse();
    let i = 1;
    let sum = 0;
    for (ele of reversed) {
        if (ele === 1) {
            sum+=i;
        };
        i*=2
    }
    return sum;
}

// console.log(binaryToDecimal(firstNumber), firstNumber);
// console.log("+");
// console.log(binaryToDecimal(secondNumber), secondNumber);
// console.log("=");
// console.log(binaryToDecimal(calOutput), calOutput)


// GUI stuff

let outputfive = document.getElementById("outputfive")
let outputfour = document.getElementById("outputfour")
let outputthree = document.getElementById("outputthree")
let outputtwo = document.getElementById("outputtwo")
let outputone = document.getElementById("outputone")
let output = document.getElementById("output")

document.getElementById("add").onclick = function() {
    let array = fourBitAdder();
    console.log("test")
    outputfive.textContent = array[0];
    outputfour.textContent = array[1];
    outputthree.textContent = array[2];
    outputtwo.textContent = array[3];
    outputone.textContent = array[4];
    output.textContent = binaryToDecimal(array);
};

let firstDigit = document.getElementById("ffirstdigit")
let secondDigit = document.getElementById("fseconddigit")
let thirdDigit = document.getElementById("fthirddigit")
let fourthDigit = document.getElementById("ffourthdigit")

let fifthDigit = document.getElementById("sfirstdigit")
let sixthDigit = document.getElementById("sseconddigit")
let seventhDigit = document.getElementById("sthirddigit")
let eighthDigit = document.getElementById("sfourthdigit")

let firstnumdec = document.getElementById("firstnumdec")
function upDateFirstNumber() {
    firstnumdec.textContent = binaryToDecimal(firstNumber);
};

let secondnumdec = document.getElementById("secondnumdec")
function upDateSecondNumber() {
    secondnumdec.textContent = binaryToDecimal(secondNumber);
};

document.getElementById("ftop1").onclick = function() {
    firstNumber[3] = 1, 
    firstDigit.textContent = firstNumber[3],
    upDateFirstNumber()
};

document.getElementById("ftop2").onclick = function() {
    firstNumber[2] = 1, 
    secondDigit.textContent = firstNumber[2],
    upDateFirstNumber()
};

document.getElementById("ftop3").onclick = function() {
    firstNumber[1] = 1, 
    thirdDigit.textContent = firstNumber[1],
    upDateFirstNumber()
};

document.getElementById("ftop4").onclick = function() {
    firstNumber[0] = 1, 
    fourthDigit.textContent = firstNumber[0],
    upDateFirstNumber()
};

document.getElementById("fbottom1").onclick = function() {
    firstNumber[3] = 0, 
    firstDigit.textContent = firstNumber[3],
    upDateFirstNumber()
};

document.getElementById("fbottom2").onclick = function() {
    firstNumber[2] = 0, 
    secondDigit.textContent = firstNumber[2],
    upDateFirstNumber()
};

document.getElementById("fbottom3").onclick = function() {
    firstNumber[1] = 0, 
    thirdDigit.textContent = firstNumber[1],
    upDateFirstNumber()
};

document.getElementById("fbottom4").onclick = function() {
    firstNumber[0] = 0, 
    fourthDigit.textContent = firstNumber[0],
    upDateFirstNumber()
};

//

document.getElementById("stop1").onclick = function() {
    secondNumber[3] = 1, 
    fifthDigit.textContent = secondNumber[3],
    upDateSecondNumber()
};

document.getElementById("stop2").onclick = function() {
    secondNumber[2] = 1, 
    sixthDigit.textContent = secondNumber[2],
    upDateSecondNumber()
};

document.getElementById("stop3").onclick = function() {
    secondNumber[1] = 1, 
    seventhDigit.textContent = secondNumber[1],
    upDateSecondNumber()
};

document.getElementById("stop4").onclick = function() {
    secondNumber[0] = 1, 
    eighthDigit.textContent = secondNumber[0],
    upDateSecondNumber()
};

document.getElementById("sbottom1").onclick = function() {
    secondNumber[3] = 0, 
    fifthDigit.textContent = secondNumber[3],
    upDateSecondNumber()
};

document.getElementById("sbottom2").onclick = function() {
    secondNumber[2] = 0, 
    sixthDigit.textContent = secondNumber[2],
    upDateSecondNumber()
};

document.getElementById("sbottom3").onclick = function() {
    secondNumber[1] = 0, 
    seventhDigit.textContent = secondNumber[1],
    upDateSecondNumber()
};

document.getElementById("sbottom4").onclick = function() {
    secondNumber[0] = 0, 
    eighthDigit.textContent = secondNumber[0],
    upDateSecondNumber()
};
