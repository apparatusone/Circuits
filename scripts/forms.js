// text entry popups
import { clickedProxy, select } from "./main.js"
import { addMdi } from "./utilities.js"
import { icons } from "./shapes.js"

const formContainer = document.getElementById("form-container");
const form = document.createElement("form");

// form container close button
const formClose = document.createElement("button");
formClose.setAttribute("id", "form-close");
formClose.innerHTML = '&times;'
//addMdi(icons.mdiCloseCircle,formClose, 'white', 24, 24)
formClose.onclick = function() {
    formContainer.replaceChildren()
    formContainer.style.visibility = "hidden";
}





// name form
//const nameFormContainer = document.getElementById("name-form-container");
const nameForm = document.querySelector("#name-form-container > form");

export function nameFormX() {
    formContainer.replaceChildren()
    form.replaceChildren()
    formContainer.appendChild(formClose)
    formContainer.style.visibility = "visible";
    formContainer.style.setProperty('--width', '350px');
    formContainer.style.setProperty('--height', '150px');

    const type = document.createElement("div");
    const addSpace = clickedProxy.object.classname.replace(/([A-Z])/g, ' $1').trim()
    type.textContent = addSpace.replace(/.+(?= Gate)/, function(v) { return v.toUpperCase(); })

    type.style.position = "absolute";
    type.style.color = "var(--text-color)";
    type.style.fontSize = "30px";
    type.style.left = "20px";
    type.style.top = "20px";
    formContainer.appendChild(type)

    form.setAttribute("id", "name-form");
    form.style.position = "absolute";
    form.style.bottom = "50px";
    formContainer.appendChild(form)

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "text-field");
    input.setAttribute("name", "text-field");
    const field = (clickedProxy.object.name === 'undefined') ? "Component Name" : clickedProxy.object.name;
    input.setAttribute("placeholder", field);
    input.setAttribute("autocomplete", "off");
    input.style.width = "200px";
    form.appendChild(input)
    input.focus()
}

form.addEventListener("submit", function(event) {
    event.preventDefault()
    const input = event.target.firstElementChild.value
    clickedProxy.object.name = input
    event.target.firstElementChild.value = ''
    formContainer.replaceChildren()
    formContainer.style.visibility = "hidden";
});



// clock form

const setClock = document.getElementById("set-clock");
setClock.onclick = function() {
    setClock.style.display = "none";
}

// label form


window.handleForm = handleForm
function handleForm(event) { event.preventDefault(); 
    let input = document.getElementById("fname").value;
    const myRe = new RegExp('[\\\/?@#\$\^&*()+=!:;.,\'\"\~\`]', 'gmi');
    const invalid = input.match(myRe);

    if (invalid !== null) {
        alert(`Invalid Character ${invalid}`)
        return
    }

    clickedProxy.object.name = input
    nameFormContainer.style.display = "none";

    document.getElementById("fname").value = ''
} 