import * as Type from './types/types'

declare global {
    var z: number;
    var smoothZoom: number;
}
window.z = 100;
window.smoothZoom = z;

interface canvasCenter {
    x: number;
    y: number;
}

export const canvasCenter:canvasCenter = {
    // set canvas center to center of window
    x: window.innerWidth/(window.z*2),
    y: window.innerHeight/(window.z*2)
}

interface origin {
    x: number,
    y: number,
    previous: {
        x: number,
        y: number,
    }
}

// set origin to center of screen
export const origin:origin = {                                         
    x: canvasCenter.x,
    y: canvasCenter.y,
    previous: { x:0, y:0 }, 
};

interface cursor {
    window: {
        current: { x: number, y: number },
        previous: { x: number, y: number },
    },
    canvas: {
        current: { x: number, y: number },
        previous: { x: number, y: number },
    },
    state: {
        clicked: boolean,
        button: 0 | 1 | 2 | null,
    },
    selected: Array<Type.ComponentType>
}

export const cursor:cursor = {
    // cursor's position relative to the window
    window: { 
        current: { x: 0, y: 0 },
        previous: { x: 0, y: 0 }
    },
    // cursor's position relative to the canvas
    get canvas() {
        return {
          current: {
            x: (this.window.current.x / z - origin.x) - 0.5,
            y: (-this.window.current.y / z + origin.y) + 0.5, 
          },
          previous: {
            x: (this.window.previous.x / z - origin.x) - 0.5,
            y: (-this.window.previous.y / z + origin.y) + 0.5, 
          },
        };
    },
    // mouse down and button
    state: {
        clicked: false,
        button: null,
    },
    selected: []
};

