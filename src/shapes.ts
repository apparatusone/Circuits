import { ComponentType } from "./types/types";

export const shape: Record< string, Function > = (function() {
    const andGate = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (-r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y + y + offset/100) * z};

        // #line471
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50.0181), yOffset(24.999));
        context.lineTo(xOffset(50.0015), yOffset(0.0102));
        context.stroke();
        
        // #polyline473
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(37.571), yOffset(75.099));
        context.lineTo(xOffset(37.503), yOffset(87.506));
        context.lineTo(xOffset(25), yOffset(100.005));
        context.stroke();
        
        // #polyline475
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(62.502), yOffset(75.099));
        context.lineTo(xOffset(62.502), yOffset(87.552));
        context.lineTo(xOffset(75), yOffset(100.005));
        context.stroke();
        
        // #path477
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50.018), yOffset(24.998));
        context.lineTo(xOffset(50.018), yOffset(24.998));
        context.bezierCurveTo(xOffset(54.986), yOffset(24.998), xOffset(59.750), yOffset(26.972), xOffset(63.264), yOffset(30.485));
        context.bezierCurveTo(xOffset(66.777), yOffset(33.998), xOffset(68.750), yOffset(38.763), xOffset(68.75), yOffset(43.731));
        context.lineTo(xOffset(68.750), yOffset(75.006));
        context.lineTo(xOffset(68.750), yOffset(75.006));
        context.lineTo(xOffset(31.285), yOffset(75.006));
        context.lineTo(xOffset(31.285), yOffset(75.006));
        context.lineTo(xOffset(31.285), yOffset(43.731));
        context.bezierCurveTo(xOffset(31.285), yOffset(33.385), xOffset(39.672), yOffset(24.999), xOffset(50.018), yOffset(24.999));
        context.closePath();
        context.fill()
        context.stroke();
    };

    const input = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        context.setLineDash([]);

        const top = (r.y + y + .2) * z;
        const left = (-r.x + x + .3) * z;
        const width = .4*z;
        const height = .6*z;
        const radius = .06*z;
        
        context.beginPath();
        context.moveTo(left + radius, top);
        context.lineTo(left + width - radius, top);
        context.arcTo(left + width, top, left + width, top + radius, radius);
        context.lineTo(left + width, top + height - radius);
        context.arcTo(left + width, top + height, left + width - radius, top + height, radius);
        context.lineTo(left + radius, top + height);
        context.arcTo(left, top + height, left, top + height - radius, radius);
        context.lineTo(left, top + radius);
        context.arcTo(left, top, left + radius, top, radius);
        context.stroke();
        context.fill()

        // switch part of switch
        const swTop = top + (height - height/2.4) * Math.min(.95, Math.max(.05, component.switchPosition))
        const swLeft = left + (width - width/1.1)/2
        const swWidth = width/1.1
        const swHeight = height/2.4
        const swRadius = .045*z

        context.lineWidth = z/95;

        if (component.state) context.fillStyle = '#39DE00';
        if (!component.state) context.fillStyle = '#ADADAD';
        
        context.beginPath();
        context.moveTo(swLeft + swRadius, swTop);
        context.lineTo(swLeft + swWidth - swRadius, swTop);
        context.arcTo(swLeft + swWidth, swTop, swLeft + swWidth, swTop + swRadius, swRadius);
        context.lineTo(swLeft + swWidth, swTop + swHeight - swRadius);
        context.arcTo(swLeft + swWidth, swTop + swHeight, swLeft + swWidth - swRadius, swTop + swHeight, swRadius);
        context.lineTo(swLeft + swRadius, swTop + swHeight);
        context.arcTo(swLeft, swTop + swHeight, swLeft, swTop + swHeight - swRadius, swRadius);
        context.lineTo(swLeft, swTop + swRadius);
        context.arcTo(swLeft, swTop, swLeft + swRadius, swTop, swRadius);
        //context.stroke();
        context.fill()

        // 'on' symbol
        context.lineWidth = z/35;
        context.beginPath();
        context.lineTo((-r.x + x + 0.5) * z, (r.y + y + .29) * z);
        context.lineTo((-r.x + x + 0.5) * z, (r.y + y + .39) * z);
        context.stroke();
        
        // 'off' symbol
        context.beginPath();
        context.arc((-r.x + x + 0.5)* z, (r.y + y + 0.66) * z, .06*z, 0, 2 * Math.PI);
        context.stroke();

        context.lineCap = 'butt';
        context.beginPath();
        context.lineTo((-r.x + x + 0.5) * z, (r.y + y + 0) * z);
        context.lineTo((-r.x + x + 0.5) * z, (r.y + y + .2) * z);
        context.stroke();
    };

    return {
        andGate,
        input,
    }
})();