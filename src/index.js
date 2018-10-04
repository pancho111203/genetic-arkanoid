import * as dat from 'dat.gui';
import Simulation from './Simulation';
import Optimization from './Optimization';
import { getUrlVars, downloadObjectAsJson } from './util';
import GeneticBridge from './GeneticBridge';

const levelNr = getUrlVars()['level'] || 0;
const demoConfig = [{
    levelNr: levelNr,
    balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
}];

const renderedSimulation = new Simulation(true, demoConfig);

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

const geneticBridge = new GeneticBridge();
const optimization = new Optimization(geneticOptions, geneticBridge);

const gui = new dat.GUI();

const downloadFolder = gui.addFolder('Download');
const controls = {
    historyFilename: 'unnamed.metrics',
    download: () => {
        optimization.saveAsFile(controls.historyFilename);
    },
    loadHistory: function () {
        optimization.loadFromFile();
    }
};
downloadFolder.add(controls, 'historyFilename').name('Download File Name');
downloadFolder.add(controls, 'download').name('Download');
downloadFolder.add(controls, 'loadHistory').name('Load');

const geneticFolder = gui.addFolder('Genetic');
const geneticControls = {
    evolve: () => {
        optimization.startOptimizer();
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

const generationsFolder = gui.addFolder('Generations');
let currentIndex = 0;
optimization.onAddedGenerations((generations) => {
    for (let gen of generations) {
        const levelConf = optimization.getLevelConfigurationFromGeneration(gen);
        const control = {
            action: () => {
                console.log(gen);
                renderedSimulation.changeLevels(levelConf);
            }
        };
        const bestFitness = optimization.getBestFitnessOfGeneration(gen);
        const isBest = optimization.bests[currentIndex];

        const name = isBest ? `${currentIndex} - ${bestFitness} - NEW BEST` :  `${currentIndex} - ${bestFitness}`;
        generationsFolder.add(control, 'action').name(name);
        currentIndex += 1;
    }
});
