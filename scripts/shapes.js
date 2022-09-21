"use strict";

import { color } from "./utilities.js";

export const shape = (function() {
    // paths
    const ledPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);
        context.lineCap = 'butt';
        context.lineJoin = 'miter';

        context.beginPath();
        context.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .10 * z, 0, 1 * Math.PI, true);
        context.lineTo((-a+ x1 + 0.4) * z, (b + y1 + .75) * z);
        context.lineTo((-a + x1 + 0.6) * z, (b + y1 + .75) * z);
        context.lineTo((-a + x1 + 0.6) * z, (b + y1 + 0.5) * z);
        context.stroke();
        context.fill();

        context.lineWidth = z/25;
        context.beginPath();
        context.lineTo((-a + x1 + 0.5) * z, (b + y1 + .75) * z);
        context.lineTo((-a + x1 + 0.5) * z, (b + y1 + 1) * z);
        context.stroke();
    };

    const clockPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        context.beginPath();
        context.lineTo((-a + x1 + 0.75) * z, (b + y1 + 0.5) * z);
        context.lineTo((-a + x1 + 1.0) * z, (b + y1 + 0.5) * z);
        context.stroke();

        
        if (Math.trunc(context.lineWidth * 10) / 10 !== Math.trunc(z/4 * 10) / 10) {
            context.lineWidth = z/15;
        }
        
        let radius = .23
        context.beginPath();
        context.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, radius * z, 0, 2 * Math.PI, true);
        context.stroke();
        context.fill();

        context.lineWidth = z/40;
        context.beginPath();
        context.lineTo((-a + x1 + 0.38) * z, (b + y1 + 0.6) * z);
        context.lineTo((-a + x1 + 0.38) * z, (b + y1 + 0.41) * z);
        context.lineTo((-a + x1 + 0.46) * z, (b + y1 + 0.41) * z);
        context.lineTo((-a + x1 + 0.46) * z, (b + y1 + 0.59) * z);
        context.lineTo((-a + x1 + 0.54) * z, (b + y1 + 0.59) * z);
        context.lineTo((-a + x1 + 0.54) * z, (b + y1 + 0.41) * z);
        context.lineTo((-a + x1 + 0.62) * z, (b + y1 + 0.41) * z);
        context.lineTo((-a + x1 + 0.62) * z, (b + y1 + 0.6) * z);
        context.stroke();
    };

    const constantPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        context.beginPath();
        context.lineTo((-a + x1 + 0.75) * z, (b + y1 + 0.5) * z);
        context.lineTo((-a + x1 + 1.0) * z, (b + y1 + 0.5) * z);
        context.stroke();

        
        if (Math.trunc(context.lineWidth * 10) / 10 !== Math.trunc(z/4 * 10) / 10) {
            context.lineWidth = z/15;
        }
        
        let radius = .23
        context.beginPath();
        context.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, radius * z, 0, 2 * Math.PI, true);
        context.stroke();
        context.fill();

        context.fillStyle = color.line;
        context.beginPath();
        context.moveTo((-a + x1 + 0.54) * z, (b + y1 + 0.35) * z);
        context.lineTo((-a + x1 + 0.41) * z, (b + y1 + 0.51) * z);
        context.lineTo((-a + x1 + 0.48) * z, (b + y1 + 0.51) * z);
        context.lineTo((-a + x1 + 0.44) * z, (b + y1 + 0.65) * z);
        context.lineTo((-a + x1 + 0.59) * z, (b + y1 + 0.47) * z);
        context.lineTo((-a + x1 + 0.51) * z, (b + y1 + 0.47) * z);
        context.closePath();
        context.fill();
    };

    const andPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        function x(off) { return (-a + x1 + off/100) * z};
        function y(off) { return (b + y1 + off/100) * z};

        // #line471
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50.018100), y(24.998900));
        context.lineTo(x(50.001500), y(0.010200));
        context.stroke();
        
        // #polyline473
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(37.571000), y(75.099000));
        context.lineTo(x(37.503000), y(87.506000));
        context.lineTo(x(25), y(100.005000));
        context.stroke();
        
        // #polyline475
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(62.502000), y(75.099000));
        context.lineTo(x(62.502000), y(87.552000));
        context.lineTo(x(75), y(100.005000));
        context.stroke();
        
        // #path477
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50.018000), y(24.998900));
        context.lineTo(x(50.018000), y(24.998900));
        context.bezierCurveTo(x(54.986221), y(24.998873), x(59.750967), y(26.972466), x(63.264048), y(30.485510));
        context.bezierCurveTo(x(66.777130), y(33.998554), x(68.750773), y(38.763279), x(68.750800), y(43.731500));
        context.lineTo(x(68.750800), y(75.006200));
        context.lineTo(x(68.750800), y(75.006200));
        context.lineTo(x(31.285400), y(75.006200));
        context.lineTo(x(31.285400), y(75.006200));
        context.lineTo(x(31.285400), y(43.731500));
        context.bezierCurveTo(x(31.285455), y(33.385794), x(39.672294), y(24.998955), x(50.018000), y(24.998900));
        context.closePath();
        context.fill()
        context.stroke();

    };

    const nandPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        function x(off) { return (-a + x1 + off/100) * z};
        function y(off) { return (b + y1 + off/100) * z};

        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50.028100), y(15.024000));
        context.lineTo(x(50.018100), y(0));
        context.stroke();
        
        // #polyline90
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(37.571000), y(75.099000));
        context.lineTo(x(37.503000), y(87.506000));
        context.lineTo(x(25.000000), y(100.005000));
        context.stroke();
        
        // #polyline92
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(62.502000), y(75.099000));
        context.lineTo(x(62.502000), y(87.552000));
        context.lineTo(x(75.000000), y(100.005000));
        context.stroke();
        
        // #path94
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50.018000), y(24.998900));
        context.lineTo(x(50.018000), y(24.998900));
        context.bezierCurveTo(x(54.986221), y(24.998873), x(59.750967), y(26.972466), x(63.264048), y(30.485510));
        context.bezierCurveTo(x(66.777130), y(33.998554), x(68.750773), y(38.763279), x(68.750800), y(43.731500));
        context.lineTo(x(68.750800), y(75.006200));
        context.lineTo(x(31.285400), y(75.006200));
        context.lineTo(x(31.285400), y(43.731500));
        context.bezierCurveTo(x(31.285510), y(33.385816), x(39.672316), y(24.999010), x(50.018000), y(24.998900));
        context.closePath();
        context.fill()
        context.stroke();
        
    // #circle96
        context.beginPath();
        context.miterLimit = 10;
        context.arc(x(50.000000), y(19.836800), .051621*z, 0, 2 * Math.PI, true);
        context.fill()
        context.stroke();
    };

    const orPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        function x(off) { return (-a + x1 + off/100) * z};
        function y(off) { return (b + y1 + off/100) * z};

        // top line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(24.9));
        context.lineTo(x(50), y(0));
        context.stroke();
	
        // lower left line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(37.6), y(72.5));
        context.lineTo(x(37.5), y(87.5));
        context.lineTo(x(25), y(100));
        context.stroke();
	
        // lower right line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(62.5), y(72));
        context.lineTo(x(62.5), y(87.6));
        context.lineTo(x(75), y(100));
        context.stroke();
	
        // main
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(70.9));
        context.bezierCurveTo(x(58.6), y(70.9), x(68.7), y(75), x(68.7), y(75));
        context.bezierCurveTo(x(68.7), y(75), x(68.9), y(59.4), x(63.9), y(46.9));
        context.bezierCurveTo(x(58.9), y(34.4), x(50), y(24.9), x(50), y(24.9));
        context.bezierCurveTo(x(49.9), y(25), x(41.1), y(34.4), x(36.1), y(46.9));
        context.bezierCurveTo(x(31.1), y(59.4), x(31.3), y(75), x(31.3), y(75));
        context.bezierCurveTo(x(31.3), y(75), x(41.5), y(70.9), x(50), y(70.9));
        context.closePath();
        context.fill();
        context.stroke();
    };

    const norPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        function x(off) { return (-a + x1 + off/100) * z};
        function y(off) { return (b + y1 + off/100) * z};

        // top line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(13.5608));
        context.lineTo(x(50), y(0));
        context.stroke();

        // lower left line
        context.beginPath();
        context.miterLimit = 10
        context.moveTo(x(37.6), y(72.5));
        context.lineTo(x(37.5), y(87.5));
        context.lineTo(x(25), y(100));
        context.stroke();

        // lower right line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(62.5), y(72.5));
        context.lineTo(x(62.5), y(87.6));
        context.lineTo(x(75), y(100));
        context.stroke();

        // main
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(70.9));
        context.bezierCurveTo(x(58.6), y(70.9), x(68.7), y(75), x(68.7), y(75));
        context.bezierCurveTo(x(68.7), y(75), x(68.9), y(59.4), x(63.9), y(46.9));
        context.bezierCurveTo(x(60.508954), y(38.851687), x(55.812474), y(31.418411), x(50), y(24.9));
        context.bezierCurveTo(x(44.177039), y(31.410502), x(39.479401), y(38.845613), x(36.1), y(46.9));
        context.bezierCurveTo(x(31.1), y(59.4), x(31.3), y(75), x(31.3), y(75));
        context.bezierCurveTo(x(31.3), y(75), x(41.5), y(70.9), x(50), y(70.9));
        context.closePath();
        context.fill();
        context.stroke();

        // top circle
        context.beginPath();
        context.miterLimit = 10;
        context.arc(x(50), y(18.722900), .05*z, 0, 2 * Math.PI, true);
        context.fill();
        context.stroke();
    };

    const xorPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        function x(off) { return (-a + x1 + off/100) * z};
        function y(off) { return (b + y1 + off/100) * z};

        // top line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(24.9));
        context.lineTo(x(50), y(0));
        context.stroke();

        // lower left line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(37.55), y(79.93));
        context.lineTo(x(37.5), y(87.5));
        context.lineTo(x(25), y(100));
        context.stroke();

        // lower right line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(62.5), y(79.93));
        context.lineTo(x(62.5), y(87.6));
        context.lineTo(x(75), y(100));
        context.stroke();

        // 
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(70.9));
        context.bezierCurveTo(x(58.6), y(70.9), x(68.7), y(75), x(68.7), y(75));
        context.bezierCurveTo(x(68.7), y(75), x(68.9), y(59.4), x(63.9), y(46.9));
        context.bezierCurveTo(x(60.5), y(38.85), x(55.8), y(31.4), x(50), y(24.9));
        context.bezierCurveTo(x(44.1), y(31.4), x(39.4), y(38.8), x(36.1), y(46.9));
        context.bezierCurveTo(x(31.1), y(59.4), x(31.3), y(75), x(31.3), y(75));
        context.bezierCurveTo(x(31.3), y(75), x(41.5), y(70.9), x(50), y(70.9));
        context.closePath();
        context.fill();
        context.stroke();

        // lower horiz line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(70.2), y(82.9));
        context.bezierCurveTo(x(70.2), y(82.9), x(59.2), y(77.6), x(49.9), y(77.6));
        context.bezierCurveTo(x(40.7), y(77.6), x(29.7), y(82.9), x(29.7), y(82.9));
        context.stroke();

    };

    const xnorPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        function x(off) { return (-a + x1 + off/100) * z};
        function y(off) { return (b + y1 + off/100) * z};

        // top line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(15.3));
        context.lineTo(x(50), y(0));
        context.stroke();

        // lower left line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(37.5), y(79.9));
        context.lineTo(x(37.5), y(87.5));
        context.lineTo(x(25), y(100));
        context.stroke();

        // lower right line
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(62.5), y(79.9));
        context.lineTo(x(62.5), y(87.6));
        context.lineTo(x(75), y(100));
        context.stroke();

        // main
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(70.9));
        context.bezierCurveTo(x(58.6), y(70.9), x(68.7), y(75), x(68.7), y(75));
        context.bezierCurveTo(x(68.7), y(75), x(68.9), y(59.4), x(63.9), y(46.9));
        context.bezierCurveTo(x(60.8), y(39.5), x(56.6), y(32.7), x(51.5), y(26.6));
        context.bezierCurveTo(x(51.2), y(26.2), x(50.6), y(25.9), x(49.9), y(25.9));
        context.bezierCurveTo(x(49.4), y(25.9), x(48.8), y(26.2), x(48.4), y(26.6));
        context.bezierCurveTo(x(43.3), y(32.7), x(39.1), y(39.5), x(36.1), y(46.9));
        context.bezierCurveTo(x(31.1), y(59.4), x(31.3), y(75), x(31.3), y(75));
        context.bezierCurveTo(x(31.3), y(75), x(41.5), y(70.9), x(50), y(70.9));
        context.closePath();
        context.fill();
        context.stroke();

        // lower horizontal
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(70.2), y(82.9));
        context.bezierCurveTo(x(70.2), y(82.9), x(59.2), y(77.6), x(49.9), y(77.6));
        context.bezierCurveTo(x(40.7), y(77.6), x(29.7), y(82.9), x(29.7), y(82.9));
        context.stroke();

        // 
        context.beginPath();
        context.miterLimit = 10;
        context.arc(x(50), y(20.5), .051*z, 0, 2 * Math.PI, true);
        context.fill();
        context.stroke();

    };

    const notPath = function (x1, y1, a, b, z, w, h, context) {
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        function x(off) { return (-a + x1 + off/100) * z};
        function y(off) { return (b + y1 + off/100) * z};

        // 
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(16.5));
        context.lineTo(x(50), y(0));
        context.stroke();
	
        // 
        context.beginPath();
        context.miterLimit = 10;
        context.arc(x(50), y(21.6), .051*z, 0, 2 * Math.PI, true);
        context.fill();
        context.stroke();
	
        // 
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(31.3), y(74.5));
        context.lineTo(x(48.7), y(29.3));
        context.bezierCurveTo(x(48.9), y(28.7), x(49.4), y(28.4), x(50), y(28.4));
        context.bezierCurveTo(x(50.5), y(28.4), x(51.1), y(28.7), x(51.2), y(29.3));
        context.lineTo(x(68.7), y(74.5));
        context.closePath();
        context.fill();
        context.stroke();
	
        // 
        context.beginPath();
        context.miterLimit = 10;
        context.moveTo(x(50), y(74.5));
        context.lineTo(x(50), y(100));
        context.stroke();

    };

    const onOffSwitchPath = function (x, y, a, b, z, w, h, context, value) {
        context.setLineDash([]);

        const top = (b + y + .2) * z;
        const left = (-a + x + .3) * z;
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
        const swTop = top + (height - height/2.4) * Math.min(.95, Math.max(.05,value.swLocation))
        const swLeft = left + (width - width/1.1)/2
        const swWidth = width/1.1
        const swHeight = height/2.4
        const swRadius = .04*z

        context.lineWidth = z/95;

        if (value.state) context.fillStyle = '#39DE00';
        if (!value.state) context.fillStyle = '#ADADAD';
        
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
        context.lineTo((-a + x + 0.5) * z, (b + y + .29) * z);
        context.lineTo((-a + x + 0.5) * z, (b + y + .39) * z);
        context.stroke();
        
        // 'off' symbol
        context.beginPath();
        context.arc((-a + x + 0.5)* z, (b + y + 0.66) * z, .06*z, 0, 2 * Math.PI);
        context.stroke();

        context.lineCap = 'butt';
        context.beginPath();
        context.lineTo((-a + x + 0.5) * z, (b + y + 0) * z);
        context.lineTo((-a + x + 0.5) * z, (b + y + .2) * z);
        context.stroke();
    };

    const labelPath = function (x, y, a, b, z, w, h, context, value) {
        context.setLineDash([]);

        if (value.name === 'undefined') {
            value.name = '...';
        }

        let fontSize = z/8
        context.font = `bold ${fontSize}px sans-serif`;
        const textWidth = context.measureText(value.name).width;

        value.w = Math.max(.7, (Math.round(((textWidth*1.2/z)) * 2) / 2).toFixed(1))
        value.hitbox.w = value.w

        const top = (b + y - h/2 + .5) * z;
        const left = (-a + x - w/2 + .5) * z;
        const width = value.w * z;
        const height = h*z;
        const radius = .04*z;
        
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

        context.fillStyle = color.line
        context.textAlign = 'center'
        context.baseline = 'middle'
        context.strokeStyle = 'black';
        context.lineWidth = z/120;

        // let x = (-origin.x + .5 + value.x) * z
        // let y = (origin.y + .53 - value.y) * z
        // let degrees = value.r - 90
        // //prevent text from being upside down
        // if (value.r === 270) degrees = 0

        //context.save();
        //context.translate((-origin.x + .5 + value.x) * z, (origin.y + .5 - value.y) * z)
        //context.rotate(degrees * -Math.PI / 180);
        //context.translate(-(-origin.x + .5 + value.x) * z, -(origin.y + .5 - value.y) * z)
        context.fillText(value.name, (-a + x + .5) * z, (b + y + .55) * z);
        //context.restore();
    };

    const custom  = function (x1, y1, a, b, z, w, h, context) {

        if (Math.round(context.lineWidth * 10) / 10 !== Math.round(z/4 * 10) / 10) {
            context.lineWidth = z/55;
            context.fillStyle = "#3E3F41";
            context.strokeStyle = color.line;
        }

        context.setLineDash([]);
        context.beginPath();

        let radius = .08
        let cornerRadius = { upperLeft: radius*z, upperRight: radius*z, lowerLeft: radius*z, lowerRight: radius*z };

        let width = w * z
        let height = h * z
        let x = ((-a + x1 + 0.5) * z) - (width/2)
        let y = ((b + y1 + .5) * z) - (height/2)

        context.beginPath();
        context.moveTo(x + cornerRadius.upperLeft, y);
        context.lineTo(x + width - cornerRadius.upperRight, y);
        context.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.upperRight);
        context.lineTo(x + width, y + height - cornerRadius.lowerRight);
        context.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.lowerRight, y + height);
        context.lineTo(x + cornerRadius.lowerLeft, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.lowerLeft);
        context.lineTo(x, y + cornerRadius.upperLeft);
        context.quadraticCurveTo(x, y, x + cornerRadius.upperLeft, y);
        context.closePath();
        context.fill();
        context.stroke();

        context.fillStyle = "#5D5D5D";
        context.lineWidth = z/100;
        context.beginPath();
        context.arc(x + width/2, y + .05*z, .08 * z, 0, 1 * Math.PI, false);
        context.lineTo(x + width/2 - .08*z, y + .01*z);
        context.lineTo(x + width/2 + .08*z, y + .01*z);
        context.closePath();
        //context.stroke();
        context.fill();
    };

    const customPins = function (x,y,w,h, z, side, context) {
        let rounded = {}
        if (side === 'left') rounded = { upperLeft: .02*z, upperRight: 0, lowerLeft: .02*z, lowerRight: 0 };
        if (side === 'right') rounded = { upperLeft: 0, upperRight: .02*z, lowerLeft: 0, lowerRight: .02*z };

        roundRectangle( x, y, w, h, rounded, true, false, context);

        context.fill();
    };

    const roundRectangle = function (x, y, width, height, radius, fill, stroke, context) {
        var cornerRadius = { upperLeft: 0, upperRight: 0, lowerLeft: 0, lowerRight: 0 };
        if (typeof stroke == "undefined") {
            stroke = true;
        }
        if (typeof radius === "object") {
            for (var side in radius) {
                cornerRadius[side] = radius[side];
            }
        }

        context.beginPath();
        context.moveTo(x + cornerRadius.upperLeft, y);
        context.lineTo(x + width - cornerRadius.upperRight, y);
        context.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.upperRight);
        context.lineTo(x + width, y + height - cornerRadius.lowerRight);
        context.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.lowerRight, y + height);
        context.lineTo(x + cornerRadius.lowerLeft, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.lowerLeft);
        context.lineTo(x, y + cornerRadius.upperLeft);
        context.quadraticCurveTo(x, y, x + cornerRadius.upperLeft, y);
        context.closePath();
        if (stroke) {
            context.stroke();
        }
        if (fill) {
            context.fill();
        }
    };

    return {
        led: ledPath,
        and: andPath,
        nand: nandPath,
        or: orPath,
        nor: norPath,
        xor: xorPath,
        xnor: xnorPath,
        not: notPath,
        clock: clockPath,
        constant: constantPath,
        switch: onOffSwitchPath,
        label: labelPath,
        custom: custom,
        pins: customPins,
        roundRectangle: roundRectangle,
    }

})();


//temp location for mdi shapes due to modules/pages issue
export const mdiPlus = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
export const mdiMinus = "M19,13H5V11H19V13Z";
export const mdiUndoVariant = "M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z";
export const mdiSelection = "M2,4C2,2.89 2.9,2 4,2H7V4H4V7H2V4M22,4V7H20V4H17V2H20A2,2 0 0,1 22,4M20,20V17H22V20C22,21.11 21.1,22 20,22H17V20H20M2,20V17H4V20H7V22H4A2,2 0 0,1 2,20M10,2H14V4H10V2M10,20H14V22H10V20M20,10H22V14H20V10M2,10H4V14H2V10Z";
export const mdiContentSave = "M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z";
export const mdiCloseCircle = "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z";
export const mdiCog = "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z";
export const dltRotate = "M49.99.17A49.83,49.83,0,1,0,99.81,50,49.83,49.83,0,0,0,49.99.17ZM82.92,69.34,70.76,83.96a.6212.6212,0,0,1-.87.1.4741.4741,0,0,1-.1-.1L57.63,69.34a.6429.6429,0,0,1,.08-.89.6773.6773,0,0,1,.41-.14h9.65V55.95A22.3866,22.3866,0,0,0,45.41,33.58l-12.59.01v9.65a.6274.6274,0,0,1-.63.63.6371.6371,0,0,1-.4-.15L17.16,31.57a.6356.6356,0,0,1-.07-.9.462.462,0,0,1,.07-.07L31.79,18.44a.6429.6429,0,0,1,.89.08.6773.6773,0,0,1,.14.41v9.65H45.41A27.3884,27.3884,0,0,1,72.77,55.95V68.31h9.66a.6253.6253,0,0,1,.63.62A.6018.6018,0,0,1,82.92,69.34Z";
export const mdiChevronRight = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z";