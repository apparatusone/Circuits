import { ComponentType } from "./types/types";
import { logic } from "./logic"

export const shape: Record< string, Function > = (function() {
    const andGate = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y - y + offset/100) * z};

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

    const nandGate = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y - y + offset/100) * z};

        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50.028100), yOffset(15.024000));
        context.lineTo(xOffset(50.018100), yOffset(0));
        context.stroke();
        
        // #polyline90
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(37.571000), yOffset(75.099000));
        context.lineTo(xOffset(37.503000), yOffset(87.506000));
        context.lineTo(xOffset(25.000000), yOffset(100.005000));
        context.stroke();
        
        // #polyline92
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(62.502000), yOffset(75.099000));
        context.lineTo(xOffset(62.502000), yOffset(87.552000));
        context.lineTo(xOffset(75.000000), yOffset(100.005000));
        context.stroke();
        
        // #path94
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50.018000), yOffset(24.998900));
        context.lineTo(xOffset(50.018000), yOffset(24.998900));
        context.bezierCurveTo(xOffset(54.986221), yOffset(24.998873), xOffset(59.750967), yOffset(26.972466), xOffset(63.264048), yOffset(30.485510));
        context.bezierCurveTo(xOffset(66.777130), yOffset(33.998554), xOffset(68.750773), yOffset(38.763279), xOffset(68.750800), yOffset(43.731500));
        context.lineTo(xOffset(68.750800), yOffset(75.006200));
        context.lineTo(xOffset(31.285400), yOffset(75.006200));
        context.lineTo(xOffset(31.285400), yOffset(43.731500));
        context.bezierCurveTo(xOffset(31.285510), yOffset(33.385816), xOffset(39.672316), yOffset(24.999010), xOffset(50.018000), yOffset(24.998900));
        context.closePath();
        context.fill()
        context.stroke();
        
    // #circle96
        context.beginPath();
        context.miterLimit = 10;
        context.arc(xOffset(50.000000), yOffset(19.836800), .051621*z, 0, 2 * Math.PI, true);
        context.fill()
        context.stroke();
    };

    const orGate = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y - y + offset/100) * z};

        // top line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(24.9));
        context.lineTo(xOffset(50), yOffset(0));
        context.stroke();
	
        // lower left line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(37.6), yOffset(72.5));
        context.lineTo(xOffset(37.5), yOffset(87.5));
        context.lineTo(xOffset(25), yOffset(100));
        context.stroke();
	
        // lower right line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(62.5), yOffset(72));
        context.lineTo(xOffset(62.5), yOffset(87.6));
        context.lineTo(xOffset(75), yOffset(100));
        context.stroke();
	
        // main
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(70.9));
        context.bezierCurveTo(xOffset(58.6), yOffset(70.9), xOffset(68.7), yOffset(75), xOffset(68.7), yOffset(75));
        context.bezierCurveTo(xOffset(68.7), yOffset(75), xOffset(68.9), yOffset(59.4), xOffset(63.9), yOffset(46.9));
        context.bezierCurveTo(xOffset(58.9), yOffset(34.4), xOffset(50), yOffset(24.9), xOffset(50), yOffset(24.9));
        context.bezierCurveTo(xOffset(49.9), yOffset(25), xOffset(41.1), yOffset(34.4), xOffset(36.1), yOffset(46.9));
        context.bezierCurveTo(xOffset(31.1), yOffset(59.4), xOffset(31.3), yOffset(75), xOffset(31.3), yOffset(75));
        context.bezierCurveTo(xOffset(31.3), yOffset(75), xOffset(41.5), yOffset(70.9), xOffset(50), yOffset(70.9));
        context.closePath();
        context.fill();
        context.stroke();
    };

    const norGate = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y - y + offset/100) * z};

        // top line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(13.5608));
        context.lineTo(xOffset(50), yOffset(0));
        context.stroke();

        // lower left line
        context.beginPath();
        context.miterLimit = 10
        context.moveTo(xOffset(37.6), yOffset(72.5));
        context.lineTo(xOffset(37.5), yOffset(87.5));
        context.lineTo(xOffset(25), yOffset(100));
        context.stroke();

        // lower right line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(62.5), yOffset(72.5));
        context.lineTo(xOffset(62.5), yOffset(87.6));
        context.lineTo(xOffset(75), yOffset(100));
        context.stroke();

        // main
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(70.9));
        context.bezierCurveTo(xOffset(58.6), yOffset(70.9), xOffset(68.7), yOffset(75), xOffset(68.7), yOffset(75));
        context.bezierCurveTo(xOffset(68.7), yOffset(75), xOffset(68.9), yOffset(59.4), xOffset(63.9), yOffset(46.9));
        context.bezierCurveTo(xOffset(60.508954), yOffset(38.851687), xOffset(55.812474), yOffset(31.418411), xOffset(50), yOffset(24.9));
        context.bezierCurveTo(xOffset(44.177039), yOffset(31.410502), xOffset(39.479401), yOffset(38.845613), xOffset(36.1), yOffset(46.9));
        context.bezierCurveTo(xOffset(31.1), yOffset(59.4), xOffset(31.3), yOffset(75), xOffset(31.3), yOffset(75));
        context.bezierCurveTo(xOffset(31.3), yOffset(75), xOffset(41.5), yOffset(70.9), xOffset(50), yOffset(70.9));
        context.closePath();
        context.fill();
        context.stroke();

        // top circle
        context.beginPath();
        context.miterLimit = 10;
        context.arc(xOffset(50), yOffset(18.722900), .05*z, 0, 2 * Math.PI, true);
        context.fill();
        context.stroke();
    };

    const xorGate = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y - y + offset/100) * z};

        // top line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(24.9));
        context.lineTo(xOffset(50), yOffset(0));
        context.stroke();

        // lower left line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(37.55), yOffset(79.93));
        context.lineTo(xOffset(37.5), yOffset(87.5));
        context.lineTo(xOffset(25), yOffset(100));
        context.stroke();

        // lower right line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(62.5), yOffset(79.93));
        context.lineTo(xOffset(62.5), yOffset(87.6));
        context.lineTo(xOffset(75), yOffset(100));
        context.stroke();

        // 
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(70.9));
        context.bezierCurveTo(xOffset(58.6), yOffset(70.9), xOffset(68.7), yOffset(75), xOffset(68.7), yOffset(75));
        context.bezierCurveTo(xOffset(68.7), yOffset(75), xOffset(68.9), yOffset(59.4), xOffset(63.9), yOffset(46.9));
        context.bezierCurveTo(xOffset(60.5), yOffset(38.85), xOffset(55.8), yOffset(31.4), xOffset(50), yOffset(24.9));
        context.bezierCurveTo(xOffset(44.1), yOffset(31.4), xOffset(39.4), yOffset(38.8), xOffset(36.1), yOffset(46.9));
        context.bezierCurveTo(xOffset(31.1), yOffset(59.4), xOffset(31.3), yOffset(75), xOffset(31.3), yOffset(75));
        context.bezierCurveTo(xOffset(31.3), yOffset(75), xOffset(41.5), yOffset(70.9), xOffset(50), yOffset(70.9));
        context.closePath();
        context.fill();
        context.stroke();

        // lower horiz line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(70.2), yOffset(82.9));
        context.bezierCurveTo(xOffset(70.2), yOffset(82.9), xOffset(59.2), yOffset(77.6), xOffset(49.9), yOffset(77.6));
        context.bezierCurveTo(xOffset(40.7), yOffset(77.6), xOffset(29.7), yOffset(82.9), xOffset(29.7), yOffset(82.9));
        context.stroke();

    };

    const xnorGate = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y - y + offset/100) * z};

        // top line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(15.3));
        context.lineTo(xOffset(50), yOffset(0));
        context.stroke();

        // lower left line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(37.5), yOffset(79.9));
        context.lineTo(xOffset(37.5), yOffset(87.5));
        context.lineTo(xOffset(25), yOffset(100));
        context.stroke();

        // lower right line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(62.5), yOffset(79.9));
        context.lineTo(xOffset(62.5), yOffset(87.6));
        context.lineTo(xOffset(75), yOffset(100));
        context.stroke();

        // main
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(70.9));
        context.bezierCurveTo(xOffset(58.6), yOffset(70.9), xOffset(68.7), yOffset(75), xOffset(68.7), yOffset(75));
        context.bezierCurveTo(xOffset(68.7), yOffset(75), xOffset(68.9), yOffset(59.4), xOffset(63.9), yOffset(46.9));
        context.bezierCurveTo(xOffset(60.8), yOffset(39.5), xOffset(56.6), yOffset(32.7), xOffset(51.5), yOffset(26.6));
        context.bezierCurveTo(xOffset(51.2), yOffset(26.2), xOffset(50.6), yOffset(25.9), xOffset(49.9), yOffset(25.9));
        context.bezierCurveTo(xOffset(49.4), yOffset(25.9), xOffset(48.8), yOffset(26.2), xOffset(48.4), yOffset(26.6));
        context.bezierCurveTo(xOffset(43.3), yOffset(32.7), xOffset(39.1), yOffset(39.5), xOffset(36.1), yOffset(46.9));
        context.bezierCurveTo(xOffset(31.1), yOffset(59.4), xOffset(31.3), yOffset(75), xOffset(31.3), yOffset(75));
        context.bezierCurveTo(xOffset(31.3), yOffset(75), xOffset(41.5), yOffset(70.9), xOffset(50), yOffset(70.9));
        context.closePath();
        context.fill();
        context.stroke();

        // lower horizontal
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(70.2), yOffset(82.9));
        context.bezierCurveTo(xOffset(70.2), yOffset(82.9), xOffset(59.2), yOffset(77.6), xOffset(49.9), yOffset(77.6));
        context.bezierCurveTo(xOffset(40.7), yOffset(77.6), xOffset(29.7), yOffset(82.9), xOffset(29.7), yOffset(82.9));
        context.stroke();

        // 
        context.beginPath();
        context.miterLimit = 10;
        context.arc(xOffset(50), yOffset(20.5), .051*z, 0, 2 * Math.PI, true);
        context.fill();
        context.stroke();
    };

    const notGate = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        //offset
        function xOffset(offset:number) { return (r.x + x + offset/100) * z};
        function yOffset(offset:number) { return (r.y - y + offset/100) * z};

        // 
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(16.5));
        context.lineTo(xOffset(50), yOffset(0));
        context.stroke();
	
        // 
        context.beginPath();
        context.miterLimit = 10;
        context.arc(xOffset(50), yOffset(21.6), .051*z, 0, 2 * Math.PI, true);
        context.fill();
        context.stroke();
	
        // 
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(31.3), yOffset(74.5));
        context.lineTo(xOffset(48.7), yOffset(29.3));
        context.bezierCurveTo(xOffset(48.9), yOffset(28.7), xOffset(49.4), yOffset(28.4), xOffset(50), yOffset(28.4));
        context.bezierCurveTo(xOffset(50.5), yOffset(28.4), xOffset(51.1), yOffset(28.7), xOffset(51.2), yOffset(29.3));
        context.lineTo(xOffset(68.7), yOffset(74.5));
        context.closePath();
        context.fill();
        context.stroke();
	
        // 
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(xOffset(50), yOffset(74.5));
        context.lineTo(xOffset(50), yOffset(100));
        context.stroke();

    };


    const input = function (component:logic.Input, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component

        context.setLineDash([]);

        const top = (r.y - y + .2) * z;
        const left = (r.x + x + .3) * z;
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

        // switch part of input
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
        context.lineTo((r.x + x + 0.5) * z, (r.y - y + .29) * z);
        context.lineTo((r.x + x + 0.5) * z, (r.y - y + .39) * z);
        context.stroke();
        
        // 'off' symbol
        context.beginPath();
        context.arc((r.x + x + 0.5)* z, (r.y - y + 0.66) * z, .06*z, 0, 2 * Math.PI);
        context.stroke();

        context.lineCap = 'butt';
        context.beginPath();
        context.lineTo((r.x + x + 0.5) * z, (r.y - y + 0) * z);
        context.lineTo((r.x + x + 0.5) * z, (r.y - y + .2) * z);
        context.stroke();
    };

    const led = function (component:ComponentType, r: {x:number, y:number}, context:CanvasRenderingContext2D):void {
        const { x, y } = component
        
        // change led color to red if state is high
        component.state ? context.fillStyle = "red" : context.fillStyle = "white"

        context.setLineDash([]);
        context.miterLimit = 10;
        context.lineCap = 'butt';
        context.lineJoin = 'round';

        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/30;
            context.lineJoin = 'miter';
        }

        context.beginPath();
        context.arc((r.x + x + 0.5) * z, (r.y - y + 0.5) * z, .10 * z, 0, 1 * Math.PI, true);
        context.lineTo((r.x+ x + 0.4) * z, (r.y - y + .75) * z);
        context.lineTo((r.x + x + 0.6) * z, (r.y - y + .75) * z);
        context.lineTo((r.x + x + 0.6) * z, (r.y - y + 0.5) * z);
        context.fill();
        context.stroke();


        context.lineWidth = z/25;
        context.beginPath();
        context.lineTo((r.x + x + 0.5) * z, (r.y - y + .75) * z);
        context.lineTo((r.x + x + 0.5) * z, (r.y - y + 1) * z);
        context.stroke();
    };

    return {
        andGate,
        nandGate,
        orGate,
        norGate,
        xorGate,
        xnorGate,
        notGate,
        input,
        led,
    }
})();