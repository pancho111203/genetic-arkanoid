import * as _ from 'ramda';
import { workerLog, clone } from './helpers';

class GeneticAlgorithmGeneric {
  constructor(options) {
    this.generationCallbacks = [];
    this.shouldEnd = false;

    this.options = options;
  }

  async evolveGen(genP) {
    const fitnesses = await this.fitness(genP);
    let gen = genP.map((config, ix) => {
      return {
        config: config.config,
        fitness: fitnesses[ix].fitness,
        otherData: fitnesses[ix].data
      };
    });

    gen.sort((a, b) => {
      return this.optimizeFitness(a.fitness, b.fitness) ? -1 : 1;
    });

    gen = this.replace(gen);
    const stats = this.calculateStats(gen);
    this.generationResult(gen, stats);

    const newGenConfigs = [];

    if (this.options.keepBest) {
      newGenConfigs.push(gen[0].config);
    }

    while (newGenConfigs.length < this.options.size) {
      const selectedPair = this.selectPair(gen);
      const childs = this.crossover(selectedPair[0], selectedPair[1]).map((child) => {
        return this.mutate(child);
      });
      newGenConfigs.push(childs[0]);
      newGenConfigs.push(childs[1]);
    }

    return newGenConfigs.map((config) => {
      return {
        config
      };
    });
  }

  async evolve(initialGeneration) {
    let gen = initialGeneration;
    if (!gen) {
      gen = [];
      for (let i = 0; i < this.options.size; i++) {
        gen.push({
          config: this.seed(),
        });
      }
    }

    for (let i = 0; i < this.options.steps && !this.shouldEnd; i++) {
      gen = await this.evolveGen(gen);
    }
    this.sendFinished();
    return gen;
  }

  terminate() {
    this.shouldEnd = true;
  }

  addGenerationCallback(cb) {
    this.generationCallbacks.push(cb);
  }

  calculateStats(pop) {
    return {};
  }

  selectPair(pop) {
    let tempPop = clone(pop);
    const a = this.select(tempPop);
    const indexOfA = tempPop.indexOf(a);
    tempPop = _.remove(indexOfA, 1, tempPop);
    const b = this.select(tempPop);
    return [a, b];
  }

  select(pop) {
    const n = pop.length;
    const a = pop[Math.floor(Math.random() * n)];
    const b = pop[Math.floor(Math.random() * n)];
    const c = pop[Math.floor(Math.random() * n)];
    let best = this.optimizeFitness(a.fitness, b.fitness) ? a : b;
    best = this.optimizeFitness(best.fitness, c.fitness) ? best : c;

    return best.config;
  }

  generationResult(population, stats) {
    this.generationCallbacks.forEach((cb) => {
      cb(population, stats);
    });
  }

  sendFinished() {
    this.generationCallbacks.forEach((cb) => {
      cb(null, null, null, true);
    });
  }

  seed() {
    throw new Error('This function needs to be implemented on the child class');
  }

  mutate(config) {
    throw new Error('This function needs to be implemented on the child class');
  }

  crossover(mother, father) {
    throw new Error('This function needs to be implemented on the child class');
  }

  fitness(gen) {
    // fitness of whole generation
    // must return array of objects [{ fitness: 34, data: {}}]
    throw new Error('This function needs to be implemented on the child class');
  }

  replace(sortedGen) {
    throw new Error('This function needs to be implemented on the child class');
  }

  optimizeFitness(a, b) {
    // if it returns true, a wil be considered better
    throw new Error('This function needs to be implemented on the child class');
  }
}

export default GeneticAlgorithmGeneric;
