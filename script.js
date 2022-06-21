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
        window[`notGate`] = new NotGate(0 ,0);
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

function OrGate(input1, input2, transistor1, transistor2, output) {
    this.input1 = input1;
    this.input2 = input2;
    this.transistor1 = transistor1;
    this.transistor2 = transistor2;
    this.output = output;
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

function TripleOrGate(input1, input2, input3, transistor1, transistor2, transistor3, output) {
    this.input1 = input1;
    this.input2 = input2;
    this.input3 = input3;
    this.transistor1 = transistor1;
    this.transistor2 = transistor2;
    this.transistor3 = transistor3;
    this.output = output;
    this.logic = function() {
        this.transistor1.collector = 1;
        this.transistor1.base = this.input1;
        this.transistor2.collector = 1;
        this.transistor2.base = this.input2;
        this.transistor3.collector = 1;
        this.transistor3.base = this.input3;
        this.transistor1.logic();
        this.transistor2.logic();
        this.transistor3.logic();
        if (this.transistor1.emitter === 1 || this.transistor2.emitter === 1 || this.transistor3.emitter === 1) {
            this.output = 1;
        } else {
            this.output = 0;
        }
    };
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

//simple adder
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

// half subtractor

function HalfSubtractor(x, y, xorGate, andGate, notGate, diff, borrowOut) {
    this.x = x;
    this.y = y;
    this.xorGate = xorGate;
    this.andGate = andGate;
    this.notGate = notGate
    this.diff = diff;
    this.borrowOut = borrowOut;
    this.logic = function() {
        this.xorGate.input1 = this.x;
        this.xorGate.input2 = this.y;
        this.notGate.input = this.x;
        notGate.logic();
        this.andGate.input1 = this.notGate.output;
        this.andGate.input2 = this.y;
        xorGate.logic();
        andGate.logic();
        this.diff = this.xorGate.output;
        this.borrowOut = this.andGate.output;
    };
}

function makeHalfSubtractor() {
    window[`halfSubtractor`] = new HalfSubtractor(0, 0, makeXorGate(1), makeAndGate(1), makeNotGate(1));
    return window[`halfSubtractor`]
}

//Full Subtractor

function FullSubtractor(a, b, borrowIn, halfSubtractor1, halfSubtractor2, orGate, diff, borrowOut) {
    this.a = a;
    this.b = b;
    this.borrowIn = borrowIn;
    this.halfSubtractor1 = halfSubtractor1;
    this.halfSubtractor2 = halfSubtractor2;
    this.orGate = orGate;
    this.diff = diff;
    this.borrowOut = borrowOut;
    this.logic = function() {
        this.halfSubtractor1.x = a;
        this.halfSubtractor1.y = b;
        halfSubtractor1.logic();
        this.halfSubtractor2.x = this.halfSubtractor1.diff;
        this.halfSubtractor2.y = this.borrowIn;
        halfSubtractor2.logic();
        this.orGate.input1 = halfSubtractor1.borrowOut;
        this.orGate.input2 = halfSubtractor2.borrowOut;
        orGate.logic();
        this.borrowOut = orGate.output;
        this.diff = halfSubtractor2.diff;
    }
}

function makeFullSubtractor() {
    window[`fullSubtractor`] = new FullSubtractor(0, 0, 0, makeHalfSubtractor(), makeHalfSubtractor(), makeOrGate(1));
    return window[`fullSubtractor`]
}

function fourBitSubtractor() {
    let subOne = new HalfSubtractor(firstNumber[3], secondNumber[3], makeXorGate(1), makeAndGate(1), makeNotGate(1));
    subOne.logic();

    let subTwo = new FullSubtractor(firstNumber[2], secondNumber[2], subOne.borrowOut, makeHalfSubtractor(), makeHalfSubtractor(), makeOrGate(1));
    subTwo.logic();

    let subThree = new FullSubtractor(firstNumber[1], secondNumber[1], subTwo.borrowOut, makeHalfSubtractor(), makeHalfSubtractor(), makeOrGate(1));
    subThree.logic();

    let subFour = new FullSubtractor(firstNumber[0], secondNumber[0], subThree.borrowOut, makeHalfSubtractor(), makeHalfSubtractor(), makeOrGate(1));
    subFour.logic();

    let calOutput = [subFour.borrowOut, subFour.diff, subThree.diff, subTwo.diff, subOne.diff]
    console.log(calOutput);
    return calOutput;
}

function fourBitMultiplier(arrayA, arrayB){
    let a = arrayA
    let b = arrayB
    let outPut = [0, 0, 0, 0, 0, 0, 0, 0]

    //generate andgates
    // for (let i = 1; i < a.length * b.length + 1; i++) {
    //     window[`multiAndGate${i}`] = makeAndGate(1);
    // };

    let multiAndGates1 = andGate = new AndGate(a[3], b[3], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates2 = andGate = new AndGate(a[3], b[2], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates3 = andGate = new AndGate(a[3], b[1], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates4 = andGate = new AndGate(a[3], b[0], makeTransistor(1), makeTransistor(1), 0, andCount);

    let multiAndGates5 = andGate = new AndGate(a[2], b[3], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates6 = andGate = new AndGate(a[2], b[2], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates7 = andGate = new AndGate(a[2], b[1], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates8 = andGate = new AndGate(a[2], b[0], makeTransistor(1), makeTransistor(1), 0, andCount);

    let multiAndGates9 = andGate = new AndGate(a[1], b[3], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates10 = andGate = new AndGate(a[1], b[2], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates11 = andGate = new AndGate(a[1], b[1], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates12 = andGate = new AndGate(a[1], b[0], makeTransistor(1), makeTransistor(1), 0, andCount);

    let multiAndGates13 = andGate = new AndGate(a[0], b[3], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates14 = andGate = new AndGate(a[0], b[2], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates15 = andGate = new AndGate(a[0], b[1], makeTransistor(1), makeTransistor(1), 0, andCount);
    let multiAndGates16 = andGate = new AndGate(a[0], b[0], makeTransistor(1), makeTransistor(1), 0, andCount);
    


    outPut[7] = multiAndGates1.output;

    let addOne = new HalfAdder(multiAndGates2.output, multiAndGates5.output, makeXorGate(1), makeAndGate(1));
    addOne.logic();
    outPut[6] = addOne.sum;
    let addTwo = new FullAdder(multiAndGates3.ouput, multiAndGates6.output, addOne.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addTwo.logic();
    let addThree = new HalfAdder(addTwo.sum, multiAndGates9.output, makeXorGate(1), makeAndGate(1));
    addThree.logic();
    outPut[5] = addThree.sum;
    let addFour = new FullAdder(multiAndGates4.ouput, multiAndGates7.output, addTwo.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addFour.logic();
    let addFive = new FullAdder(addFour.sum, multiAndGates10.ouput, addThree.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addFive.logic();
    let addSix = new HalfAdder(addFive.sum, multiAndGates13.output, makeXorGate(1), makeAndGate(1));
    addSix.logic();
    outPut[4] = addSix.sum;
    let addSeven = new FullAdder(multiAndGates8.output, multiAndGates11, addFour.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addSeven.logic();
    let addEight = new FullAdder(addSeven.sum, multiAndGates14, addFive.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addEight.logic();
    let addNine = new HalfAdder(addEight.sum, addSix.carryOut, makeXorGate(1), makeAndGate(1));
    addNine.logic();
    outPut[3] = addNine.carryOut;
    let addTen = new FullAdder(multiAndGates12.output, multiAndGates15, addSeven.carryOut, makeHalfAdder(), makeHalfAdder(), makeOrGate(1));
    addTen.logic();
    let addEleven = new HalfAdder(addTen.sum, addEight.carryOut, makeXorGate(1), makeAndGate(1));
    addEleven.logic();
    let addTwelve = new HalfAdder(addEleven.sum, addNine.carryOut, makeXorGate(1), makeAndGate(1));
    addTwelve.logic();
    outPut[2] = addTwelve.sum;
    let addThirteen = new HalfAdder(multiAndGates16, addTen.carryOut, makeXorGate(1), makeAndGate(1));
    addThirteen.logic();
    let addFourteen = new HalfAdder(addThirteen.sum, addEleven.carryOut, makeXorGate(1), makeAndGate(1));
    addFourteen.logic();
    let addFifteen = new HalfAdder(addFourteen.sum, addTwelve.carryOut, makeXorGate(1), makeAndGate(1));
    addFifteen.logic();
    outPut[1] = addFifteen.sum;
    let tOrGate = new TripleOrGate(addThirteen.carryOut, addFourteen.carryOut, addFifteen.carryOut, makeTransistor(1), makeTransistor(1), makeTransistor(1), 0)
    tOrGate.logic();
    outPut[0] = tOrGate.output;
    return outPut;
}

fourBitMultiplier(firstNumber, secondNumber);

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
    outputfive.textContent = array[0];
    outputfour.textContent = array[1];
    outputthree.textContent = array[2];
    outputtwo.textContent = array[3];
    outputone.textContent = array[4];
    output.textContent = binaryToDecimal(array);
};

document.getElementById("sub").onclick = function() {
    let array = fourBitSubtractor();
    outputfive.textContent = array[0];
    outputfour.textContent = array[1];
    outputthree.textContent = array[2];
    outputtwo.textContent = array[3];
    outputone.textContent = array[4];
    output.textContent = binaryToDecimal(array);
};

document.getElementById("multi").onclick = function() {
    let array = fourBitMultiplier(firstNumber, secondNumber);
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
