export const shape = (function() {
    /**
     * @param x
     * @param y
     * @param context 
     */

    const andGate = function (x:number, y:number, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (-r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y + y + offset/100) * z};
        
        // function x(off) { return (-a + x1 + off/100) * z};
        // function y(off) { return (b + y1 + off/100) * z};

        // #line471
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50.018100), yOffset(24.998900));
        context.lineTo(xOffset(50.001500), yOffset(0.010200));
        context.stroke();
        
        // #polyline473
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(37.571000), yOffset(75.099000));
        context.lineTo(xOffset(37.503000), yOffset(87.506000));
        context.lineTo(xOffset(25), yOffset(100.005000));
        context.stroke();
        
        // #polyline475
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(62.502000), yOffset(75.099000));
        context.lineTo(xOffset(62.502000), yOffset(87.552000));
        context.lineTo(xOffset(75), yOffset(100.005000));
        context.stroke();
        
        // #path477
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50.018000), yOffset(24.998900));
        context.lineTo(xOffset(50.018000), yOffset(24.998900));
        context.bezierCurveTo(xOffset(54.986221), yOffset(24.998873), xOffset(59.750967), yOffset(26.972466), xOffset(63.264048), yOffset(30.485510));
        context.bezierCurveTo(xOffset(66.777130), yOffset(33.998554), xOffset(68.750773), yOffset(38.763279), xOffset(68.750800), yOffset(43.731500));
        context.lineTo(xOffset(68.750800), yOffset(75.006200));
        context.lineTo(xOffset(68.750800), yOffset(75.006200));
        context.lineTo(xOffset(31.285400), yOffset(75.006200));
        context.lineTo(xOffset(31.285400), yOffset(75.006200));
        context.lineTo(xOffset(31.285400), yOffset(43.731500));
        context.bezierCurveTo(xOffset(31.285455), yOffset(33.385794), xOffset(39.672294), yOffset(24.998955), xOffset(50.018000), yOffset(24.998900));
        context.closePath();
        context.fill()
        context.stroke();
    };

    return {
        andGate: andGate,
    }
})();