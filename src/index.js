import Simulation from './Simulation';
import { getUrlVars } from './util';
import GeneticBridge from './GeneticBridge';


const levelNr = getUrlVars()['level'] || 0;
const trackedConfigurations = [];

const demoConfig = [{
    levelNr: 20,
    balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
}];

const renderedSimulation = new Simulation(true, demoConfig);

window.run = () => {
    renderedSimulation.run();
}

window.pause = () => {
    renderedSimulation.pause();
}

window.reset = () => {
    renderedSimulation.reset();
}

function renderTrackedConfig(index) {
    const config = trackedConfigurations[index];
    renderedSimulation.changeLevels(config);
}

function addTrackedConfigButton(index, isNewBest) {
    const trackedConfigButtonsElement = document.getElementById('trackedConfigButtons');
    const button = document.createElement('button');
    if (isNewBest) {
        button.style.backgroundColor = 'green';
        button.style.color = 'white';
    }
    button.innerText = index;

    button.addEventListener('click', () => {
        renderTrackedConfig(index);
    });

    trackedConfigButtonsElement.appendChild(button);
}

let bestFitness = 999999;
const geneticBridge = new GeneticBridge();
geneticBridge.onGenerationReceived((data) => {
    if (data.generation) {
        const bestInd = data.generation[0];
        const currentBestFitness = bestInd.fitness;
        let isNewBest = false;
        if (currentBestFitness < bestFitness) {
            bestFitness = currentBestFitness;
            isNewBest = true;
        }
        console.log('Generation received:');
        console.log(data.generation);
        console.log('LevelsConfig:');
        const levelConfigs = data.generation.map((ind) => {
            return {
                levelNr: data.level,
                balls: ind.config
            };
        });
        console.log(levelConfigs);
        console.log('Stats:');
        console.log(data.stats);
        trackedConfigurations.push(levelConfigs);
        addTrackedConfigButton(trackedConfigurations.length - 1, isNewBest);
    }
});
geneticBridge.startOptimizer(levelNr);