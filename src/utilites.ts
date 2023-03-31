import { cursor } from './Globals';
import * as Type from './types/types'

export function easeOutBounce(x:number):number {
    const n1:number = 7.5625;
    const d1:number = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

export const within = (function() {
    /**
     * Check if a point is within a rectanlge
     * @param {Type.Coordinate} pos position of rectangle { x:number, y:number }
     * @param {number} w width of rectangle
     * @param {number} h height of rectangle
     * @param {Type.Coordinate} point position of point { x:number, y:number }
     * @returns {boolean} True if the point is in the shape, False if it isn't
     */
    const rectangle = function (pos:Type.Coordinate, w:number, h:number, point:Type.Coordinate):boolean {
        if(point.x > pos.x - 0.5 && point.x < pos.x - 0.5 + w && point.y > pos.y - 0.5 && point.y < pos.y - 0.5 + h) {
            return true;
        }
        return false;
    }

    /**
     * Check if a point is within a circle
     * @param {Type.Coordinate} pos position of rectangle { x:number, y:number }
     * @param {number} r radius of circle
     * @param {Type.Coordinate} point position of point { x:number, y:number }
     * @returns {boolean} True if the point is in the shape, False if it isn't
     */
    const circle = function (pos:Type.Coordinate, r:number, point:Type.Coordinate): boolean {
        const distSqr = Math.pow(pos.x - point.x, 2) + Math.pow(pos.y - point.y, 2);
    
        if (distSqr < r * r) {
            return true;
        }
        return false;
    }
    return {
        rectangle,
        circle,
    }
})();

export function rotateCoordinate(coordinate:Type.Coordinate, r:number):Type.Coordinate {
    const { x, y } = coordinate;

    const positions: Record< number, { x: number; y: number }> = {
        0: { x: x, y: y },
        90: { x: y, y: -x },
        180: { x: -x, y: -y },
        270: { x: -y, y: x },
    };

    return positions[r];
}