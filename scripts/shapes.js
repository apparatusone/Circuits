"use strict";

export const shape = (function() {
    // paths
    const ledPath = function (x1, y1, a, b, z, w, h, context) {
        context.strokeStyle = 'rgba(0,0,0,1)';
        context.lineWidth = z/15;
        context.setLineDash([]);

        context.beginPath();
        context.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .10 * z, 0, 1 * Math.PI, true);
        context.lineTo((-a+ x1 + 0.4) * z, (b + y1 + .75) * z);
        context.lineTo((-a + x1 + 0.6) * z, (b + y1 + .75) * z);
        context.lineTo((-a + x1 + 0.6) * z, (b + y1 + 0.5) * z);
        context.stroke();
        context.fill();

        context.lineWidth = z/25;
        context.lineCap = 'butt';
        context.beginPath();
        context.lineTo((-a + x1 + 0.5) * z, (b + y1 + .75) * z);
        context.lineTo((-a + x1 + 0.5) * z, (b + y1 + 1) * z);
        context.stroke();
    };

    const clockPath = function (x1, y1, a, b, z, w, h, context) {
        context.strokeStyle = 'rgba(0,0,0,1)';
        context.lineWidth = z/15;
        context.setLineDash([]);

        context.beginPath();
        context.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .25 * z, 0, 2 * Math.PI, true);
        context.stroke();
        context.fill();

        context.lineWidth = z/25;
        context.lineCap = 'butt';
        context.beginPath();
        context.lineTo((-a + x1 + 0.75) * z, (b + y1 + 0.5) * z);
        context.lineTo((-a + x1 + 1.0) * z, (b + y1 + 0.5) * z);
        context.stroke();

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

    const onOffSwitchPath = function (x, y, a, b, z, w, h, context) {
        context.strokeStyle = 'rgba(0,0,0,1)';
        context.lineWidth = z/15;
        context.setLineDash([]);

        const top = (b + y + .2) * z;
        const left = (-a + x + .3) * z;
        const width = .4*z;
        const height = .6*z;
        const radius = .075*z;
        
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

        context.lineWidth = z/25;
        context.beginPath();
        context.lineTo((-a + x + 0.5) * z, (b + y + .3) * z);
        context.lineTo((-a + x + 0.5) * z, (b + y + .4) * z);
        context.stroke();
        
        context.beginPath();
        context.arc((-a + x + 0.5)* z, (b + y + 0.65) * z, .06*z, 0, 2 * Math.PI);
        context.stroke();

        context.lineCap = 'butt';
        context.beginPath();
        context.lineTo((-a + x + 0.5) * z, (b + y + 0) * z);
        context.lineTo((-a + x + 0.5) * z, (b + y + .2) * z);
        context.stroke();
    };

    const custom  = function (x1, y1, a, b, z, w, h, context) {
        context.strokeStyle = 'rgba(0,0,0,1)';
        context.fillStyle = "#3E3F41";
        context.lineWidth = z/55;
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

    const customPins = function (x,y,a,b, z, context) {
        roundedRectangle(
        (-a + x + 0.465) * z,
        (b + y + .425) * z,
        .07*z,
        .15*z,
        {upperLeft: .02*z, lowerLeft: .02*z}, true, false, context);

        context.fill();
    };

    const roundedRectangle = function (x, y, width, height, radius, fill, stroke, context) {
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

    //
    return {
        led: ledPath,
        clock: clockPath,
        switch: onOffSwitchPath,
        custom: custom,
        pins: customPins,
        roundRectangle: roundedRectangle,
    }

})();