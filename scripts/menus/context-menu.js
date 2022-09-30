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
    nameComponent()
}

function nameComponent() {
    if (select.components.length === 0) {
        return
    }

    if (select.components.length === 1) {
        clearHighlight( 'objects' )
        clickedProxy.object.highlight = true;
    }

    rightClickMenu.addEventListener("transitionend", nameFormX, true);
    //rightClickMenu.removeEventListener("transitionend", nameFormX, true);
    //nameFormX()
    //document.getElementById("fname").focus()

    //document.getElementById('name-form-type').textContent = clickedProxy.object.classname
    
    // if (clickedProxy.object.name !== "undefined") {
    //     document.getElementById('name-form-label').textContent = `Name: ${clickedProxy.object.name}`
    // } else {
    //     document.getElementById('name-form-label').textContent = ''
    // }
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

options.onmouseover = function() {
    clearTimeout(hideTimer)
    rightClickSecondary.style.visibility = "visible";

    const left = options.getBoundingClientRect().left
    const top = options.getBoundingClientRect().top
    
    rightClickSecondary.style.left = (left + 160)+"px";
    rightClickSecondary.style.top = (top)+"px";
};

options.onmouseout = function() {
    //get cursor trajectory
    const array = []
    let delta = {x: 0, y: 0}
    function set(e) {
        let point = {x: e.screenX, y: e.screenY}
        array.push(point)
        delta.x = e.movementX
        delta.y = e.movementY  
    }

    document.addEventListener('mousemove', set, true);

    // if cursor is moving to secondary menu
    setTimeout(function() {
        document.removeEventListener('mousemove', set, true)
        const s = slope(array.pop(), array.shift())
        if (s < -.15 || s > 1.3) rightClickSecondary.style.visibility = "hidden";
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
        }, 80);
    }

    setTimeout(() => {
        rightClickMenu.style.opacity = "0"
        rightClickSecondary.style.opacity = "0";
    }, 100);

    setTimeout(() => {
        rightClickMenu.style.visibility = 'hidden';
        rightClickSecondary.style.visibility = "hidden";
        if (clicked !== undefined) clicked.style.backgroundColor = ''
        rightClickMenu.style.opacity = "100"
        rightClickSecondary.style.opacity = "100";
    }, 250);
}