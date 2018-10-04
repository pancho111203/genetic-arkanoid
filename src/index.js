import * as dat from 'dat.gui';
import Simulation from './Simulation';
import { getUrlVars, downloadObjectAsJson } from './util';
import GeneticBridge from './GeneticBridge';


const levelNr = getUrlVars()['level'] || 0;
let history = {};
const demoConfig = [{
    levelNr: levelNr,
    balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
}];

const renderedSimulation = new Simulation(true, demoConfig);

function renderTrackedConfig(index) {
    const generation = history['generations'][index];
    const config = generation.generation.map((ind) => {
        return {
            levelNr: generation.level,
            balls: ind.config
        };
    });
    console.log(generation);
    renderedSimulation.changeLevels(config);
}

function addHistoryButton(index, isNewBest) {
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

function reloadHistoryButtons() {
    // Remove all previous elements first
    const trackedConfigButtonsElement = document.getElementById('trackedConfigButtons');
    while (trackedConfigButtonsElement.firstChild) {
        trackedConfigButtonsElement.removeChild(trackedConfigButtonsElement.firstChild);
    }
    let bestFitness = 9999999;
    const generations = history['generations'];
    for (let i = 0; i < generations.length; i++) {
        const gen = generations[i];
        const bestCurFitness = gen.generation[0].fitness;
        let isNewBest = false;
        if (bestCurFitness < bestFitness) {
            isNewBest = true;
            bestFitness = bestCurFitness;
        }
        addHistoryButton(i, isNewBest);
    }
}

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

        history['generations'].push(data);
        addHistoryButton(history['generations'].length - 1, isNewBest);
    }
});


const gui = new dat.GUI();
const downloadFolder = gui.addFolder('Download');
const controls = {
    historyFilename: 'unnamed.metrics',
    download: () => {
        downloadObjectAsJson(history, controls.historyFilename);
    },
    loadHistory: function () {
        const input = document.getElementById('fileInput')

        input.addEventListener('change', function () {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (function (theFile) {
                return function (e) {
                    try {
                        const json = JSON.parse(e.target.result);
                        history = json;
                        reloadHistoryButtons();
                        const lastGen = history['generations'][history['generations'].length - 1].generation;
                        geneticBridge.startOptimizer(parseInt(history['generations'][0].level), history['options'], lastGen);
                        bestFitness = lastGen[0].fitness;
                    } catch (ex) {
                        throw new Error('ex when trying to parse json = ' + ex);
                    }
                }
            })(file);
            reader.readAsText(file);
        });

        input.click();
    }
};
downloadFolder.add(controls, 'historyFilename').name('Download File Name');
downloadFolder.add(controls, 'download').name('Download');
downloadFolder.add(controls, 'loadHistory').name('Load');

const geneticOptions = {
    level: 0,
    size: 10,
    steps: 100,
    keepBest: true,
    timestep: 1 / 60,
    updatesPerTimestep: 500,
    maxBalls: 10,
    fixedNumberOfBalls: false,
    mutationFunction: 0,
    crossoverFunction: 0,
    fitnessFunction: 0,
    replaceFunction: 0,
    selectionOverTwo: true
};

const geneticFolder = gui.addFolder('Genetic');
const geneticControls = {
    evolve: () => {
        console.log('Starting evolution with options:');
        console.log(geneticOptions);
        console.log('Alert: changing the options from this point on will have no effect');
        history['options'] = geneticOptions;
        geneticBridge.startOptimizer(geneticOptions.level, geneticOptions);
    }
};
geneticFolder.add(geneticControls, 'evolve').name('Start Evolution');
geneticFolder.add(geneticOptions, 'level');
geneticFolder.add(geneticOptions, 'size');
geneticFolder.add(geneticOptions, 'steps');
geneticFolder.add(geneticOptions, 'keepBest');
geneticFolder.add(geneticOptions, 'timestep');
geneticFolder.add(geneticOptions, 'updatesPerTimestep');
geneticFolder.add(geneticOptions, 'maxBalls');
geneticFolder.add(geneticOptions, 'fixedNumberOfBalls');
geneticFolder.add(geneticOptions, 'mutationFunction');
geneticFolder.add(geneticOptions, 'crossoverFunction');
geneticFolder.add(geneticOptions, 'fitnessFunction');
geneticFolder.add(geneticOptions, 'replaceFunction');
geneticFolder.add(geneticOptions, 'selectionOverTwo');

const simulationFolder = gui.addFolder('Simulation');
const simulationControls = {
    run: () => {
        renderedSimulation.run();
    },
    pause: () => {
        renderedSimulation.pause();
    },
    reset: () => {
        renderedSimulation.reset();
    }
};
simulationFolder.add(simulationControls, 'run').name('Run');
simulationFolder.add(simulationControls, 'pause').name('Pause');
simulationFolder.add(simulationControls, 'reset').name('Reset');

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
