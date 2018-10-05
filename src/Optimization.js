import { downloadObjectAsJson, loadFileAsJson } from './util';
import { clone } from './optimizers/helpers';
import GeneticBridge from './GeneticBridge';
import AnnealingBridge from './AnnealingBridge';

class Optimization {
  constructor(initialSettings) {
    this.generations = [];
    this.bests = [];
    this.settings = clone(initialSettings);
    this.bestFitness = 99999999999;
    this.cantChangeSettings = false;
    this.addedGenerationsCallbacks = [];
  }

  startOptimizer() {
    console.log('Starting optimizer with settings:');
    console.log(this.settings);

    if (this.settings.optimizer == 'genetic') {
      this.bridge = new GeneticBridge();
    } else if (this.settings.optimizer == 'annealing') {
      this.bridge = new AnnealingBridge();
    } else {
      throw new Error('Invalid optimizer type');
    }

    this.bridge.onGenerationReceived(({ generation, level, stats }) => {
      this.addGeneration(generation);
    });
    this.bridge.startOptimizer(this.settings.level, this.settings);
    this.lockSettings();
  }

  setSettings(newSettings) {
    const stns = clone(newSettings);
    if (!this.cantChangeSettings) {
      this.settings = stns;
    } else {
      console.error('Cant change settings after the optimization has started!')
    }
  }

  getLevelConfigurationFromGeneration(generation) {
    return generation.map((ind) => {
      return {
        levelNr: this.settings.level,
        balls: ind.config
      };
    });
  }

  getLastGeneration() {
    return this.generations[this.generations.length - 1];
  }

  getSettings() {
    return this.settings;
  }

  onAddedGenerations(cb) {
    this.addedGenerationsCallbacks.push(cb);
  }

  getBestFitnessOfGeneration(generation) {
    const bestInd = generation[0];
    return bestInd.fitness;
  }

  _pushGenerationUnsafe(generation) {
    // Unsafe because we don't update settings or ui, call 'addGeneration' instead
    if (!this.cantChangeSettings) {
      console.error('Added a generation without locking the settings, you forgot to call lockSettings!');
    }
    const currentBestFitness = this.getBestFitnessOfGeneration(generation);
    let isNewBest = false;
    if (currentBestFitness < this.bestFitness) {
      this.bestFitness = currentBestFitness;
      isNewBest = true;
    }

    this.generations.push(generation);
    this.bests.push(isNewBest);
  }

  _triggerAddedGenerations(generations) {
    if (generations.length === undefined) {
      generations = [generations];
    }
    for (let cb of this.addedGenerationsCallbacks) {
      cb(generations, this.generations);
    }
  }

  addGeneration(generation) {
    this._pushGenerationUnsafe(generation);
    this._triggerAddedGenerations([generation]);
  }

  lockSettings() {
    this.cantChangeSettings = true;
  }

  setGenerations(generations) {
    this.generations = [];
    this.bests = [];
    this.bestFitness = 99999999999;

    for (let generation of generations) {
      this._pushGenerationUnsafe(generation);
    }

    this._triggerAddedGenerations(generations);
  }

  clean() {
    this.generations = [];
    this.bests = [];
    this.bestFitness = 99999999999;
    this.cantChangeSettings = false;
  }

  saveAsFile(filename) {
    downloadObjectAsJson({ generations: this.generations, settings: this.settings }, filename);
  }

  loadFromFile() {
    loadFileAsJson((json) => {
      const settings = json.settings;
      const generations = json.generations;

      this.clean();
      this.setSettings(settings);
      this.setGenerations(generations);
      this.lockSettings();
    });
  }
}

export default Optimization;


