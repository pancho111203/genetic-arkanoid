import { downloadObjectAsJson, loadFileAsJson } from './util';

class Optimization {
  constructor(initialSettings, bridge) {
    this.generations = [];
    this.bridge = bridge;
    this.bests = [];
    this.settings = initialSettings;
    this.bestFitness = 99999999999;
    this.cantChangeSettings = false;
    this.addedGenerationsCallbacks = [];
    this.bridge.onGenerationReceived(({ generation, level, stats }) => {
      this.addGeneration(generation);
    });
  }

  startOptimizer() {
    console.log('Starting optimizer with settings:');
    console.log(this.settings);
    this.bridge.startOptimizer(this.settings.level, this.settings);
    this.lockSettings();
  }

  setSettings(newSettings) {
    if (!this.cantChangeSettings) {
      this.settings = newSettings;
    } else {
      throw new Error('Cant change settings after the optimization has started!')
    }
  }

  getLevelConfigurationFromGeneration(generation) {
    return generation.map((ind) => {
      return {
        levelNr: generation.level,
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


