"use strict";

// return true if string 'a' is anywhere in string 'b'
export function stringIncludes (a,b) {
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
window.iterate = 1
export const idCreator = function* () {
    while (true) yield iterate++;
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

// Capitalize first letter of a string
export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

var _cls_ = {}; // serves as a cache, speed up later lookups
export function getClass(name){
  if (!_cls_[name]) {
    // cache is not ready, fill it up
    if (name.match(/^[a-zA-Z0-9_]+$/)) {
      // proceed only if the name is a single word string
      _cls_[name] = eval(name);
    } else {
      // arbitrary code is detected 
      throw new Error("?");
    }
  }
  return _cls_[name];
}

//colors
export const color = (function() {
    const root = document.documentElement;

    let background, line, object, grid, menu, icon, tooltip, rotate, windowBox;

    function update() {
        this.background = (settings.darkMode) ? "rgba(15,15,15,1)":"white";
        this.line = (settings.darkMode) ? "white":"black";
        this.object = (settings.darkMode) ? "#222222":"white";
        this.grid = (settings.darkMode) ? "rgba(255,255,255,.5)":"rgba(150,150,150,.3)";
        this.menu = (settings.darkMode) ? "rgba(255, 255, 255, 0.5)":"rgba(0, 7, 21, 0.738)";
        this.sideMenu = (settings.darkMode) ? "rgba(170, 170, 170, 0.6)":"rgba(0, 7, 21, 0.5)";
        this.icon = (settings.darkMode) ? "black":"white";
        this.tooltip = (settings.darkMode) ? "white":"black";
        this.rotate = (settings.darkMode) ? "white":"rgba(0, 7, 21, 0.7)";
        this.windowBox = (settings.darkMode) ? "rgba(170, 170, 170, 0.6)":"#000000ba";
    
        root.style.setProperty('--menu-color', this.menu);
        root.style.setProperty('--side-menu-color', this.sideMenu);
        root.style.setProperty('--text-color', this.icon);
        root.style.setProperty('--tooltip-color', this.tooltip);
        root.style.setProperty('--window-color', this.windowBox);
    
        const self = this
        // update color of top menu icons
        const icons = document.querySelectorAll('.post-icon')
        icons.forEach(function(icon){
        icon.setAttribute('fill', self.icon);
        })

        // update color of rotate buttons
        const rotate = document.querySelectorAll('.rotate')
        rotate.forEach(function(icon){
            icon.setAttribute('fill', self.rotate);
            })
    }

    return {
        update: update,

        background: background,
        line: line,
        object: object,
        grid: grid,
        menu: menu,
        icon: icon,
        tooltip: tooltip,
        rotate: rotate
    }
})();

export const radians = function (degree) {
    return degree * (Math.PI / 180)
}

export function average(array) {
    const sum = array.reduce((a, b) => a + b, 0);
    return (sum / array.length) || 0;
}
