import Simulation from './Simulation';
import { getUrlVars } from './util';
import GeneticBridge from './GeneticBridge';


const levelNr = getUrlVars()['level'] || 0;
const trackedConfigurations = [];

const demoConfig = [{
    levelNr: 20,
    balls: [[[-34.09, -27.18, 0], [-0.67, 0.74, 0]]]
}];

const renderedSimulation = new Simulation(true, demoConfig);

function renderTrackedConfig(index) {
    const config = trackedConfigurations[index];
    renderedSimulation.changeLevels(config);
}

function addTrackedConfigButton(index) {
    const trackedConfigButtonsElement = document.getElementById('trackedConfigButtons');
    const button = document.createElement('button');
    button.innerText = index;

    button.addEventListener('click', () => {
        renderTrackedConfig(index);
    });

    trackedConfigButtonsElement.appendChild(button);
}

window.run = () => {
    renderedSimulation.run();
}

window.pause = () => {
    renderedSimulation.pause();
}

window.reset = () => {
    renderedSimulation.reset();
}

const geneticBridge = new GeneticBridge();
geneticBridge.onGenerationReceived((data) => {
    if (data.generation) {
        console.log('Generation received:');
        console.log(data.generation);
        console.log('Stats:');
        console.log(data.stats);
        trackedConfigurations.push(data.generation);
        addTrackedConfigButton(trackedConfigurations.length - 1);
    }
});
geneticBridge.startOptimizer(levelNr);