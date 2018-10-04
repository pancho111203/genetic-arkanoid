import * as dat from 'dat.gui';
import Simulation from './Simulation';
import { getUrlVars, downloadObjectAsJson } from './util';
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

const geneticOptions = {
    size: 10,
    steps: 100,
    keepBest: true,
    timestep: 1 / 60,
    updatesPerTimestep: 500,
    maxBalls: 10,
    fixedNumberOfBalls: false,
    mutationFunction: 0,
    crossoverFunction: 0,
    fitnessFunction: 0
};

const history = {};
history['options'] = geneticOptions;
history['generations'] = [];

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

        history['generations'].push(data);
        trackedConfigurations.push(levelConfigs);
        addTrackedConfigButton(trackedConfigurations.length - 1, isNewBest);
    }
});
geneticBridge.startOptimizer(levelNr, geneticOptions);


const gui = new dat.GUI();
const downloadFolder = gui.addFolder('Download');
const controls = {
    historyFilename: 'unnamed.metrics',
    download: () => {
        downloadObjectAsJson(history, controls.historyFilename);
    }
};
downloadFolder.add(controls, 'historyFilename');
downloadFolder.add(controls, 'download');
// const controls = {
//     giroBase: -113,
//     giroBrazo: -38,
//     giroAntebrazoY: 42,
//     giroAntebrazoZ: -60,
//     giroPinza: 29,
//     separacionPinza: 15
// };

// controlFolder.add(controls, 'giroBase', -180, 180).onChange(() => {
//     console.log(controls.giroBase);
// });
// controlFolder.add(controls, 'giroBrazo', -45, 45).onChange(() => {
//     console.log(controls.giroBrazo);
// });
// controlFolder.add(controls, 'giroAntebrazoY', -180, 180).onChange(() => {
//     console.log(controls.giroAntebrazoY);
// });
// controlFolder.add(controls, 'giroAntebrazoZ', -90, 90).onChange(() => {
//     console.log(controls.giroAntebrazoZ);
// });
// controlFolder.add(controls, 'giroPinza', -40, 220).onChange(() => {
//     console.log(controls.giroPinza);
// });
// controlFolder.add(controls, 'separacionPinza', 0, 15).onChange(() => {
//     console.log(controls.separacionPinza);
// });
