"use strict";

export const shape = (function() {
    // paths
    const ledPath = function (x1, y1, a, b, z, w, h, context) {
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
        context.setLineDash([]);

        // set linewidth when not highlight
        if (Math.trunc(context.lineWidth * 10) / 10 !== Math.trunc(z/4 * 10) / 10) {
            context.lineWidth = z/25;
        }

        context.beginPath();
        context.lineTo((-a + x1 + 0.75) * z, (b + y1 + 0.5) * z);
        context.lineTo((-a + x1 + 1.0) * z, (b + y1 + 0.5) * z);
        context.stroke();

        
        if (Math.trunc(context.lineWidth * 10) / 10 !== Math.trunc(z/4 * 10) / 10) {
            context.lineWidth = z/15;
        }
        
        context.beginPath();
        context.arc((-a + x1 + 0.5) * z, (b + y1 + 0.5) * z, .25 * z, 0, 2 * Math.PI, true);
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

    const onOffSwitchPath = function (x, y, a, b, z, w, h, context) {
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

        if (Math.trunc(context.lineWidth * 10) / 10 !== Math.trunc(z/4 * 10) / 10) {
            context.lineWidth = z/55;
            context.fillStyle = "#3E3F41";
            context.strokeStyle = 'rgba(0,0,0,1)';
        }

        //context.strokeStyle = 'rgba(0,0,0,1)';
        //context.fillStyle = "#3E3F41";
        //context.lineWidth = z/55;
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


//temp location for mdi shapes due to modules/pages issue
export const mdiPlus = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
export const mdiMinus = "M19,13H5V11H19V13Z";
export const mdiUndoVariant = "M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z";
export const mdiSelection = "M2,4C2,2.89 2.9,2 4,2H7V4H4V7H2V4M22,4V7H20V4H17V2H20A2,2 0 0,1 22,4M20,20V17H22V20C22,21.11 21.1,22 20,22H17V20H20M2,20V17H4V20H7V22H4A2,2 0 0,1 2,20M10,2H14V4H10V2M10,20H14V22H10V20M20,10H22V14H20V10M2,10H4V14H2V10Z";
export const mdiContentSave = "M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z";
export const mdiCloseCircle = "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z";