import { Logic } from "./logic";
import { circuit } from "./app";
import { cursor } from "./Globals";

const io: Array<string> = ["input", "led"];

const elementary: Array<string> = [
    "andGate",
    "nandGate",
    "orGate",
    "norGate",
    "xorGate",
    "xnorGate",
    "notGate",
];

const composite: Array<string> = ["multiplexor"];

const misc: Array<string> = [];
const components = [...io, ...elementary, ...composite, ...misc];

const componentMenu = document.getElementById("component-menu")!;

// generate component menu
(async () => {
    const ioSVG: Record<string, string> = await loadComponentsSVG(io);
    const elementarySVG: Record<string, string> = await loadComponentsSVG(
        elementary
    );
    const compositeSVG: Record<string, string> = await loadComponentsSVG(
        composite
    );
    const miscSVG: Record<string, string> = await loadComponentsSVG(misc);

    let html: string = "";
    template("input / output", io, ioSVG);
    template("Elementary Gates", elementary, elementarySVG);
    template("Composite Gate", composite, compositeSVG);
    template("Miscellaneous", misc, miscSVG);

    componentMenu.innerHTML = html;

    components.forEach((component) => {
        const element = document.getElementById(component)!;
        element.addEventListener("dragstart", onDragStart);
    });

    function template(
        title: string,
        nameArray: Array<string>,
        svgList: Record<string, string>
    ) {
        html += `<p class="component-menu-heading">${title}</p><hr>`;
        nameArray.forEach((component: string) => {
            html += `
                    <div class="component-menu-item">
                        <div id="${component}" style="position: relative; display: grid; place-items: center; width: 110px; height: 110px; cursor: grab;">
                            <div style="width: 95px; height: 95px; border: 2px solid #A1A2A3FF; border-radius: 12px;"></div>
                            <img data-component=${component} src="${
                svgList[component]
            }" alt=${component} style="position: absolute; width: 100%; height: 100%; overflow: visible;" draggable="true">
                        </div>
                        <p style="text-transform: uppercase;">${component.replace(
                            "Gate",
                            ""
                        )}</p>
                    </div>
                  `;
        });
    }
})();

const canvas = document.getElementById("canvas")!;
canvas.addEventListener("dragover", allowDrop);
canvas.addEventListener("drop", addComponent);

function onDragStart(e: DragEvent) {
    const target = e.target as HTMLElement;
    target.id = "dragging";
}

function allowDrop(e: DragEvent) {
    e.preventDefault();
}

// add component to canvas at cursor position
function addComponent(e: DragEvent) {
    e.preventDefault();
    const draggedElement = document.getElementById("dragging");
    draggedElement.removeAttribute("id");

    const gate: string = capitalizeFirstLetter(
        draggedElement.getAttribute("data-component")
    );

    cursor.window.current = { x: e.x, y: e.y };
    circuit.addComponent(
        new Logic[gate](
            Math.round(cursor.canvas.current.x * 2) / 2,
            Math.round(cursor.canvas.current.y * 2) / 2
        )
    );
}

/**
 * Asynchronously loads SVG files for a list of component names.
 * @param {Array<string>} names - An array of component names.
 * @returns {Promise<Record<string, string>>} - A promise that resolves to an object
 * containing the component names as keys and their corresponding SVG content as values.
 */
async function loadComponentsSVG(names: Array<string>) {
    const componentsSVG: Record<string, string> = {};

    for (const name of names) {
        const svgModule = await import(`./assets/${name.toLowerCase()}.svg`);
        componentsSVG[name] = svgModule.default;
    }

    return componentsSVG;
}

function capitalizeFirstLetter(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
}
