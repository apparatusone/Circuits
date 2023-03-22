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
    x: - Number.parseFloat((window.innerWidth/(window.z*2)).toFixed(3)) + 0.5,
    y: Number.parseFloat((window.innerHeight/(window.z*2)).toFixed(3)) - 0.5
}

interface mouse {
    screen: {
        x: number,
        y: number
    }
}

// rename to cursor
export const cursor = {
    // cursor's position relative to the screen (window)
    screen: { x: 0, y: 0 },
    // cursor's position relative to the canvas
    canvas: { x: 0, y: 0 },
    // cell: {x: 0, y: 0},
    //offset for moving multiple objects
    // moveOffset: {components: [], nodes: []}
};

interface origin {
    x: number,
    y: number,
}

// set origin to center of screen
export const origin:origin = {                                         
    x: canvasCenter.x,
    y: canvasCenter.y,
    // click: { x:0, y:0 },
    // prev: { x:0, y:0 },                      
};