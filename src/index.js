import * as dat from 'dat.gui';
import Simulation from './Simulation';
import Optimization from './Optimization';
import { getUrlVars, downloadObjectAsJson } from './util';

import lvl13_6246 from '../dist/results/genetic_lvl13_6246.json';
import lvl13_6374 from '../dist/results/genetic_lvl13_6374.json';
import lvl15_5371 from '../dist/results/genetic_lvl15_5371.json';
import lvl15_5988_fixed4 from '../dist/results/genetic_lvl15_5988_fixed4.json';
import lvl15_6615 from '../dist/results/genetic_lvl15_6615.json';
import lvl19_3624 from '../dist/results/genetic_lvl19_3624.json';
import lvl19_4588 from '../dist/results/genetic_lvl19_4588.json';
import lvl20_3324 from '../dist/results/genetic_lvl20_3324.json';
import lvl20_3390 from '../dist/results/genetic_lvl20_3390.json';
import lvl20_3840 from '../dist/results/genetic_lvl20_3840.json';
import lvl20_4459 from '../dist/results/genetic_lvl20_4459.json';
 
const levelNr = getUrlVars()['level'] || 0;

const demoConfig = [{
    levelNr: levelNr,
    balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
}];

// const demoConfig = [{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },{
//     levelNr: levelNr,
//     balls: [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]]
// },];

const renderedSimulation = new Simulation(true, demoConfig, 1/60);

const geneticSettings = {
    optimizer: 'genetic',
    level: levelNr,
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

const annealingSettings = {
    optimizer: 'annealing',
    level: levelNr,
    initialTemperature: 100,
    maxIterations: 100000,
    coolingFactor: 0.9,
    timestep: 1 / 60,
    updatesPerTimestep: 1000,
    fitnessFunction: 0,
    successorFunction: 0,
    coolingFunction: 0
};

const optimization = new Optimization(geneticSettings);

const gui = new dat.GUI();

const serverFiles = {
    lvl13_6246: lvl13_6246,
    lvl13_6374: lvl13_6374,
    lvl15_5371: lvl15_5371,
    lvl15_5988_fixed4: lvl15_5988_fixed4,
    lvl15_6615: lvl15_6615,
    lvl19_3624: lvl19_3624,
    lvl19_4588: lvl19_4588,
    lvl20_3324: lvl20_3324,
    lvl20_3390: lvl20_3390,
    lvl20_3840: lvl20_3840,
    lvl20_4459: lvl20_4459
};

const downloadFolder = gui.addFolder('Download');
const controls = {
    historyFilename: 'unnamed.metrics',
    download: () => {
        optimization.saveAsFile(controls.historyFilename);
    },
    loadHistory: function () {
        optimization.loadFromFile();
    },
    serverFile: 'lvl20_3324',
    loadFromServer: function () {
        const json = serverFiles[controls.serverFile];
        optimization.load(json.settings, json.generations);
    }
};



downloadFolder.add(controls, 'historyFilename').name('Download File Name');
downloadFolder.add(controls, 'download').name('Download');
downloadFolder.add(controls, 'loadHistory').name('Load');
downloadFolder.add(controls, 'serverFile', [
    'lvl13_6246',
    'lvl13_6374',
    'lvl15_5371',
    'lvl15_5988_fixed4',
    'lvl15_6615',
    'lvl19_3624',
    'lvl19_4588',
    'lvl20_3324',
    'lvl20_3390',
    'lvl20_3840',
    'lvl20_4459'
]).name('Server file');
downloadFolder.add(controls, 'loadFromServer').name('Load from server');

const optimizerFolder = gui.addFolder('Optimizer');
const optimizerControls = {
    evolve: () => {
        let settings;
        if (optimizerControls.optimizer == 'genetic') {
            settings = geneticSettings;
        } else {
            settings = annealingSettings;
        }
        optimization.setSettings(settings);
        optimization.startOptimizer();
    },
    optimizer: 'genetic'
};
optimizerFolder.add(optimizerControls, 'optimizer', ['genetic', 'annealing']);
optimizerFolder.add(optimizerControls, 'evolve').name('Start Evolution');

const geneticFolder = optimizerFolder.addFolder('Genetic');
geneticFolder.add(geneticSettings, 'level');
geneticFolder.add(geneticSettings, 'size');
geneticFolder.add(geneticSettings, 'steps');
geneticFolder.add(geneticSettings, 'keepBest');
geneticFolder.add(geneticSettings, 'timestep');
geneticFolder.add(geneticSettings, 'updatesPerTimestep');
geneticFolder.add(geneticSettings, 'maxBalls');
geneticFolder.add(geneticSettings, 'fixedNumberOfBalls');
geneticFolder.add(geneticSettings, 'mutationFunction');
geneticFolder.add(geneticSettings, 'crossoverFunction');
geneticFolder.add(geneticSettings, 'fitnessFunction');
geneticFolder.add(geneticSettings, 'replaceFunction');
geneticFolder.add(geneticSettings, 'selectionOverTwo');

const annealingFolder = optimizerFolder.addFolder('Annealing');
annealingFolder.add(annealingSettings, 'level');
annealingFolder.add(annealingSettings, 'initialTemperature');
annealingFolder.add(annealingSettings, 'maxIterations');
annealingFolder.add(annealingSettings, 'coolingFactor');
annealingFolder.add(annealingSettings, 'timestep');
annealingFolder.add(annealingSettings, 'updatesPerTimestep');
annealingFolder.add(annealingSettings, 'fitnessFunction');
annealingFolder.add(annealingSettings, 'successorFunction');
annealingFolder.add(annealingSettings, 'coolingFunction');


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
    },
    howMany: 'one'
};
simulationFolder.add(simulationControls, 'howMany', ['one', 'all']).name('Sims to run');
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
                if (simulationControls.howMany == 'one') {
                    renderedSimulation.changeLevels([levelConf[0]]);
                } else {
                    renderedSimulation.changeLevels(levelConf);
                }
            }
        };
        const bestFitness = optimization.getBestFitnessOfGeneration(gen);
        const isBest = optimization.bests[currentIndex];

        const name = isBest ? `${currentIndex} - ${bestFitness} - NEW BEST` : `${currentIndex} - ${bestFitness}`;
        generationsFolder.add(control, 'action').name(name);
        currentIndex += 1;
    }
});
