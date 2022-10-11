// right click menu

import { clickedProxy, select } from "../main.js"
import { addMdi, slope, getOffset, clearHighlight, generateId, makeCustomComponent } from "../utilities.js"
import { icons } from "../shapes.js"
import { nameFormX } from "../forms.js"


const rightClickMenu = document.getElementById("right-click");
rightClickMenu.addEventListener("click", hideRightClickMenu, false);

// show and locate context menu
document.addEventListener('contextmenu', function(e) {
    // handle right click event at edges of screen
    let loc = {x: 0, y: 0}
    const width = getOffset(rightClickMenu).width;
    const height = getOffset(rightClickMenu).height;

    // right x boundary
    (e.pageX + width > window.innerWidth) ? loc.x = e.pageX - width : loc.x = e.pageX;

    // bottom y boundary
    (e.pageY + height > window.innerHeight) ? loc.y = window.innerHeight - height - 6 : loc.y = e.pageY - 5;

    rightClickMenu.style.visibility = "visible";
    rightClickMenu.style.left = (loc.x)+"px";
    rightClickMenu.style.top = (loc.y)+"px";
    e.preventDefault();
}, false);

// rename component
const nameButton = document.getElementById("name-component");
nameButton.onclick = function() {
    if (!clickedProxy.object) return
    if (select.components.length === 0) {
        return
    }

    if (select.components.length === 1) {
        clearHighlight( 'objects' )
        clickedProxy.object.highlight = true;
    }

    rightClickMenu.addEventListener("transitionend", nameFormX, true);
}

// create custom component from selection
const customComponentButton = document.getElementById("custom-component");
customComponentButton.onclick = function() {
    let parts = select.components
    const id = generateId()
    let cc = makeCustomComponent(parts, id)
    
    if (cc === undefined) return
    
    objects[id] = cc
}

// save custom component to drag and drop menu
const saveComponentButton = document.getElementById("save-component");
saveComponentButton.onclick = function() {
    let object = clickedProxy.object
    if (select.components.length > 1) {
        alert("can only save 1 component")
        return
    }

    if (object.constructor !== CustomComponent) {
        alert("object is not a Custom Component")
        return
    }

    let obj = convertSelectiontoJson(true)
}

// const undoContext = document.getElementById("undo-context");
// undoContext.onmouseover = function() {
//     if (rightClickSecondaryExit) rightClickSecondary.style.visibility = "hidden";
//     rightClickSecondaryExit = false
//     hideTimer = setTimeout(function() {
//         rightClickSecondary.style.visibility = "hidden";
//     }, 500)
// }


//secondary menu
const rightClickSecondary = document.getElementById("right-click-secondary");
rightClickSecondary.addEventListener("click", hideRightClickMenu, false);

const chevron = document.getElementById("chevron");
addMdi(icons.mdiChevronRight, chevron, 'white', 20, 15, 'chevron')

const options = document.getElementById("options");

rightClickSecondary.onmouseover= function() {
    //clear hide timer
    clearTimeout(hideTimer)
}

rightClickSecondary.onmouseout= function() {
    //exit event
    rightClickSecondaryExit = true;
}


let hideTimer;
let rightClickSecondaryExit = false;

options.onmouseover = function(e) {
    clearTimeout(hideTimer)

    // handle event at edge of screen
    let loc = {x: 0, y: 0}
    const width = getOffset(rightClickMenu).width + getOffset(rightClickSecondary).width;

    const left = options.getBoundingClientRect().left;
    const top = options.getBoundingClientRect().top;
    const optionsMenuWidth = options.getBoundingClientRect().width;
    const contextMenuWidth = rightClickMenu.getBoundingClientRect().width;

    // right x boundary
    (rightClickMenu.getBoundingClientRect().left + width > window.innerWidth) ? loc.x = left - contextMenuWidth : loc.x = left + optionsMenuWidth;

    rightClickSecondary.style.visibility = "visible";

    rightClickSecondary.style.left = loc.x+"px";
    rightClickSecondary.style.top = (top)+"px";
};

options.onmouseout = function(e) {
    //get cursor trajectory
    const array = []
    let delta = {x: 0, y: 0}
    let start = {x: e.screenX, y: e.screenY}
    function set(event) {
        let point = {x: event.screenX, y: event.screenY}
        array.push(point)
        delta.x = Math.abs(event.movementX)
        delta.y = Math.abs(event.movementY) 
    }

    document.addEventListener('mousemove', set, true);

    const optionsMenuLeft = rightClickSecondary.getBoundingClientRect().left;
    const contextMenuLocation = rightClickMenu.getBoundingClientRect().left;

    const segment = 0

    // if cursor is moving to secondary menu
    setTimeout(function() {
        document.removeEventListener('mousemove', set, true)
        const s = slope(array.pop(), array.shift())

        console.log(delta.y)

        //hide if not going towards menu
        if (optionsMenuLeft > contextMenuLocation) {
            if (s < -.15 || s > 1.3) rightClickSecondary.style.visibility = "hidden";
        } else {
            console.log('left')
            console.log(s)
            if (s < -1 || s > .25) rightClickSecondary.style.visibility = "hidden";
        }

        // hide if slow mouse speed
        if (delta.y < 2 && delta.x < 1) rightClickSecondary.style.visibility = "hidden";
    }, 70)
};


// async ?
export function hideRightClickMenu() {
    let clicked;

    const buttons = document.querySelectorAll('#right-click > div, #right-click-secondary > div');

    for (const button of buttons) {
        if (button.matches(':hover')) {
            clicked = button
        }
    }

    if (clicked !== undefined) {
        clicked.style.pointerEvents = 'none'
        clicked.style.backgroundColor = 'transparent'

        setTimeout(() => {
            clicked.style.pointerEvents = 'auto'
            clicked.style.backgroundColor = '#2289ffe7'
        }, 60);
    }

    setTimeout(() => {
        rightClickMenu.style.opacity = "0"
        rightClickSecondary.style.opacity = "0";
    }, 80);

    setTimeout(() => {
        rightClickMenu.style.visibility = 'hidden';
        rightClickSecondary.style.visibility = "hidden";
        if (clicked !== undefined) clicked.style.backgroundColor = ''
        rightClickMenu.style.opacity = "100"
        rightClickSecondary.style.opacity = "100";
    }, 150);
}