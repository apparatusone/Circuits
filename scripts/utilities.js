"use strict";


import { origin, z } from './main.js'

// return true if string 'a' is anywhere in string 'b'
export function stringInString (a,b) {
    const regex = new RegExp( a, 'gi' );
    return regex.test(b)
}

// return boolean for a point within a shape 
export const within = (function() {

    // is point (a,b) within rectanlge at (x,y) with width 'w' and height 'h'
    const rectangle = function (x, y, w, h, a, b) {
        if(a > x && a < x + w && b > y && b < y + h) {
            return true;
        }
        return false;
    }

    // is point (a,b) within circle at (x,y) with radius 'r'
    const circle = function (x, y, r, a, b) {
        const distSqr = Math.pow(x - a, 2) + Math.pow(y - b, 2);
    
        if (distSqr < r * r) {
            return true;
        }
        return false;
    }
    return {
        rectangle: rectangle,
        circle: circle,
    }

})();

//TODO: move to shapes.js
export const drawShape = (function() {

    const circle = function (x,y,r,context) {
        context.fillStyle = '#FFFFFF';
        context.setLineDash([]);
    
        context.beginPath();
        context.arc((-origin.x + x + 0.5) * z, (origin.y - y + 0.5) * z, r*z, 0, 2 * Math.PI);
        context.stroke();
    }

    return {
        circle: circle,
    }
    
})();

// function to generate unique id for components
const idCreator = function* () {
    let i = 1;
    while (true) yield i++;
};
const idsGenerator = idCreator();
export const generateId = () => idsGenerator.next().value;

// get minimum and maximum of array
export const minMax = function (items) {
    const map1 = items.map(ele => ele);

    return map1.reduce((acc, val) => {
        acc[0] = ( acc[0] === undefined || val < acc[0] ) ? val : acc[0]
        acc[1] = ( acc[1] === undefined || val > acc[1] ) ? val : acc[1]
        return acc;
    }, []);
}

// return slope of line between points 'a' and 'b'
export const slope = function ( a, b)
{
    if (b.x - a.x != 0)
    {
        return (b.y - a.y) / (b.x - a.x);
    }
    return Number.MAX_VALUE;
}
