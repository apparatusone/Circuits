// menu at top

import { select, clickedProxy } from "../main.js"
import { Wire, CustomComponent, Clock, ConstantHigh } from "../parts.js"
import { addMdi, color, formatBytes, getOffset } from "../utilities.js"
import { icons } from '../shapes.js'

// action menu buttons
const undobutton = document.getElementById("undo");
addMdi(icons.mdiUndoVariant,undobutton, color.icon, 24, 24, 'post-icon')
undobutton.onclick = function() {
    // if (wires.length === 0) return;

    // let wireId = wires[(wires.length - 1)].id

    // for (const ele in objects) {
    //     for (const e of objects[ele].nodes) {
    //         if (objects[ele][e].connection === wireId) {
    //             objects[ele][e].connection = undefined
    //         }
    //     }
    // }
    // wires.pop()
}

// reset canvas to origin
const zoomPercentage = document.getElementById("zoomlevel");
zoomPercentage.innerHTML = Math.round(z) + '%';
zoomPercentage.onclick = function() {
    z = 100;
    smoothZoom = z;
    origin.x = canvasCenter.x;
    origin.y = canvasCenter.y;
    zoomPercentage.innerHTML = Math.round(z) + '%';
};

// FIXME: ZOOM BUTTONS
const zoomInButton = document.getElementById("zoom-in");
addMdi(icons.mdiPlus,zoomInButton, color.icon, 24, 24, 'post-icon')
zoomInButton.onmousedown = function() {

    // zoom in to selected object
    mouse.screen.x = (clickedProxy.object !== undefined) ? clickedProxy.object.gridCoordinates.x : window.innerWidth/2
    mouse.screen.y = (clickedProxy.object !== undefined) ? clickedProxy.object.gridCoordinates.y : window.innerHeight/2

    smoothZoom = Math.min(500, Math.round(smoothZoom + settings.zoomButtons));
    zoomPercentage.innerHTML = Math.round(smoothZoom) + '%';
};

const zoomOutButton = document.getElementById("zoom-out");
addMdi(icons.mdiMinus,zoomOutButton, color.icon, 24, 24, 'post-icon')
zoomOutButton.onclick = function() {

    //zoom out of selected object
    mouse.screen.x = (clickedProxy.object !== undefined) ? clickedProxy.object.gridCoordinates.x : window.innerWidth/2
    mouse.screen.y = (clickedProxy.object !== undefined) ? clickedProxy.object.gridCoordinates.y : window.innerHeight/2

    smoothZoom = Math.max(10, Math.round(smoothZoom - settings.zoomButtons));
    zoomPercentage.innerHTML = smoothZoom + '%';
};


// FIXME: SIMPLIFY CLASSES
const selectButton = document.getElementById("select");
addMdi(icons.mdiSelection,selectButton, color.icon, 24, 24, 'post-icon')
selectButton.onclick = function() {
    if (select.action) {
        select.action = false;
        selectButton.classList.remove("action-menu-item-highlight")
    } else {
        select.action = true;
        selectButton.classList.add("action-menu-item-highlight")
    }
}

// FIXME: refactor and fix exceptions (clock / constant high)
const saveButton = document.getElementById("save");
addMdi(icons.mdiContentSave,saveButton, color.icon, 24, 24, 'post-icon')
saveButton.onclick = function() {
    window.localStorage.clear();

    for (let object of Object.values(objects)) {

        if (object.constructor === CustomComponent) {
            storeCustomComponent(object)
            continue
        }

        if (object.constructor === Clock) {
            console.log('reject clock')
            continue
        }

        if (object.constructor === ConstantHigh) {
            console.log('reject constant')
            continue
        }

        storeObject(object, false)
    }

    for (let [key, wire] of Object.entries(wires)) {
        storeWire(wire, false)
    }

    // if no objects set generator to 1
    if (Object.keys(objects).length === 0) {
        window.localStorage.setItem('gen', 1)
        return
    }

    // get largest id
    const keysObjects = Object.keys(objects);
    const keysWires = Object.keys(wires);
    const maxId = Math.max(...keysObjects, ...keysWires)
    // store value for id generator
    window.localStorage.setItem('gen', maxId + 1)

    // store settings
    window.localStorage.setItem('darkMode', settings.darkMode)
    window.localStorage.setItem('showLabels', settings.showLabels)

    function storeWire(wire) {
        window.localStorage.setItem(wire.id, JSON.stringify(
            { 
                'type': 'wire',
                'a': {id: wire.node.a.id, name: wire.node.a.name},
                'b': {id: wire.node.b.id, name: wire.node.b.name},
                'nodes': wire.nodes
            }, replacerConnectionType
        ));
    }

    function storeObject(object) {
        window.localStorage.setItem(object.id, JSON.stringify(
            { 
                'type': 'object',
                'component': object,
            }, replacerImg
        ));
    }

    function storeCustomComponent(component) {

        window.localStorage.setItem(component.id, JSON.stringify(
            { 
                'type': 'customcomponent',
                'component': component,
                'list': Object.keys(component.objects)
            }, replacer
        ));

        for (const [id, object] of Object.entries(component.objects)) {
            if (object.constructor === CustomComponent) {
                storeCustomComponent(object)
                continue
            }
            storeObject(object)
        }

        for (const [id, wire] of Object.entries(component.wires)) {
            storeWire(wire)
        }
    }

    function replacerImg(key, value) {
        // Filtering out properties
        if (key === 'image' || key === 'img') {
            return;
        }
        return value;
    }
    
    function replacer(key, value) {
        // Filtering out properties
        if (key === 'objects' || key === 'connectionType') {
            return;
        }
        return value;
    }

    function replacerConnectionType(key, value) {
        // Filtering out properties
        if (key === 'connectionType') {
            for (const [key, wire] of Object.entries(value)) {
                if (wire.constructor === Wire) return 'wires'
            }
            return;
        }
        return value;
    }

    const limit = 1024 * 1024 * 5; // 5 MB
    const used = decodeURI(encodeURIComponent(JSON.stringify(localStorage))).length
    const remSpace = limit - used;
    console.log(`${formatBytes(used)} used of Local Storage. ${formatBytes(remSpace)} remaining`);

    if (remSpace <= 0) {
        alert('Local Storage is full')
    }
}

// FIXME: menu hides when clicking checkbox
const settingsButton = document.getElementById("settings");
addMdi(icons.mdiCog,settingsButton, color.icon, 24, 24, 'post-icon')
settingsButton.onclick = function() {

    if (settingsMenu.style.visibility === 'visible') {
        hideSettingsMenu()
        return
    }

    globalCond.disableToolTip = true
    tooltip.style.display = "none";

    let top = getOffset(settingsButton).top;
    settingsMenuObserver.observe(settingsMenu);
    settingsMenu.style.visibility = "visible";
    settingsMenuArrow.style.visibility = "visible";

    settingsMenu.style.width = '200px'
    settingsMenu.style.height = `${14 + 16*settingsArray.length}px`

    settingsMenu.style.top = (top+44)+"px";

    setTimeout(() => {
        settings.open = true
        settingsMenuObserver.disconnect()
      }, "500")
}


// TOOLTIP
const buttons = document.querySelectorAll('.btn')
const tooltip = document.getElementById("tooltip")
const toolText = document.getElementById("tooltip-text")

// show tooltip on mouseover
buttons.forEach(function(currentBtn){
    currentBtn.addEventListener('mouseover', function() {
      if (globalCond.disableToolTip) return
      let left = getOffset(currentBtn).left;
      let top = getOffset(currentBtn).top;
      tooltip.style.width = "fit-content"
      
      tooltip.style.display = "flex";
      toolText.textContent = currentBtn.name
      let width = getOffset(currentBtn).width;
      let length = toolText.offsetWidth + 20
  
      tooltip.style.left = (left - length/2 + width/2 )+"px";
      tooltip.style.top = (top+51)+"px";
    });
})

// hide tooltip on mouseout
buttons.forEach(function(currentBtn){
    currentBtn.addEventListener('mouseout', function() {
            tooltip.style.display = "none";
    });
})

// SETTINGS MENU
const settingsMenu = document.getElementById("settings-menu");
const settingsMenuArrow = document.getElementById("settings-menu-arrow");
const settingsArray = Array.from(settingsMenu.children);

// unhide each setting as div expands
const settingsMenuObserver = new ResizeObserver(entries => {
    let height = 5
    entries.forEach(entry => {
        settingsArray.forEach( setting => {
            if (entry.contentRect.height > height) document.getElementById(setting.id).style.visibility = "visible";
            if (entry.contentRect.height > height) document.getElementById(setting.id).style.opacity = "1";
            height+=20
        });
    });
});

export function hideSettingsMenu() {
    if (!settings.open) return

    settingsMenu.style.visibility = "hidden";
    settingsMenuArrow.style.visibility = "hidden";
    settingsMenu.style.width = '41px'
    settingsMenu.style.height = '0px'

    settingsArray.forEach( setting => {
        document.getElementById(setting.id).style.visibility = "hidden";
        document.getElementById(setting.id).style.opacity = "0";
    });

    globalCond.disableToolTip = false
    settings.open = false
}

// enable / disable darkmode
const darkMode = document.getElementById("menu-darkmode");
darkMode.addEventListener('change', function() {
    if (this.checked) {
        settings.darkMode = true;
        color.update()
    } else {
        settings.darkMode = false;
        color.update()
    }
});

// enable / disable always show labels
const showLabels = document.getElementById("menu-show-labels");
showLabels.addEventListener('change', function() {
    if (this.checked) {
        settings.showLabels = true;
    } else {
        settings.showLabels = false;
    }
});

// enable / disable welcome message
// const welcomeClose = document.getElementById("welcome-close");
// addMdi(mdiCloseCircle,welcomeClose, 'white', 24, 24)
// const welcome = document.getElementById("welcome");
// welcomeClose.onclick = function() {
//     welcome.style.display = "none";
// }

const smoothZoomBox = document.getElementById("menu-smooth-zoom");
smoothZoomBox.addEventListener('change', function() {
  if (this.checked) {
    settings.smoothZoom = true;
  } else {
    settings.smoothZoom = false;
  }
});

