// right click menu

import { addMdi, slope, getOffset } from "../utilities.js"
import { icons } from "../shapes.js"


const rightClickMenu = document.getElementById("right-click");
rightClickMenu.addEventListener("click", hideRightClickMenu, false);

// show and locate context menu
document.addEventListener('contextmenu', function(e) {
    // handle right click event at edges of screen
    let loc = {x: 0, y: 0}
    const width = getOffset(rightClickMenu).width
    const height = getOffset(rightClickMenu).height

    if (e.pageX + width > window.innerWidth) {
        loc.x = e.pageX - width
    } else {
        loc.x = e.pageX
    }

    if (e.pageY + height > window.innerHeight) {
        loc.y = window.innerHeight - height - 6
    } else {
        loc.y = e.pageY - 5
    }

    rightClickMenu.style.visibility = "visible";
    rightClickMenu.style.left = (loc.x)+"px";
    rightClickMenu.style.top = (loc.y)+"px";
    e.preventDefault();
}, false);

export function hideRightClickMenu() {
    rightClickMenu.style.visibility = 'hidden';
    rightClickSecondary.style.visibility = "hidden";
}







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

    setTimeout(function() {
        document.removeEventListener('mousemove', set, true)
        const s = slope(array.pop(), array.shift())
        if (s < -.15 || s > 1.3) rightClickSecondary.style.visibility = "hidden";
        if (delta.y < 2 && delta.x < 1) rightClickSecondary.style.visibility = "hidden";
    }, 70)

};