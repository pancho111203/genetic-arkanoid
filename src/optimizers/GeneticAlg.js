import _ from 'ramda';

const DEFAULT_CONFIG = {
  size: 10,
  steps: 10,
  keepBest: true
}

class GeneticAlg {
  constructor(level, config = DEFAULT_CONFIG) {
    this.generationCallbacks = [];
    this.shouldEnd = false;

    this.level = level;
    this.configuration = config;
  }

  evolve() {
    if (this.configuration.steps === 0) {
      const computed = this.compute(DEFAULT_CONFIG);
      const ind = {
        config: DEFAULT_CONFIG,
        computed,
        fitness: this.fitness(DEFAULT_CONFIG, computed)
      }
      this.generationResult([ind], this.calculateStats([ind]));
      return;
    }

    let gen = [];
    for (let i = 0; i < this.configuration.size; ++i) {
      gen.push({
        config: this.seed(),
      });
    }

    for (let i = 0; i < this.configuration.steps && !this.shouldEnd; i++) {
      gen = gen.map((individual) => {
        const config = individual.config;
        const computedConfig = this.compute(config);
        const fitness = this.fitness(config, computedConfig);
        return {
          config,
          computed: computedConfig,
          fitness
        }
      })

      gen.sort((a, b) => {
        return this.optimizeFitness(a.fitness, b.fitness) ? -1 : 1;
      });

      gen = this.replace(gen);
      const stats = this.calculateStats(gen);
      this.generationResult(gen, stats);

      const newGenConfigs = [];

      if (this.configuration.keepBest) {
        newGenConfigs.push(gen[0].config);
      }

      while (newGenConfigs.length < this.configuration.size) {
        const selectedPair = this.selectPair(gen);
        const childs = this.crossover(selectedPair[0], selectedPair[1]).map((child) => {
          return this.mutate(child);
        });
        newGenConfigs.push(childs[0]);
        newGenConfigs.push(childs[1]);
      }

      gen = newGenConfigs.map((config) => {
        return {
          config
        };
      })
    }
    this.sendFinished();
  }

  terminate() {
    this.shouldEnd = true;
  }

  addGenerationCallback(cb) {
    this.generationCallbacks.push(cb);
  }

  calculateStats(pop) {
    const mean = pop.reduce(function (a, b) { return a + b.fitness; }, 0) / pop.length;
    const stdev = Math.sqrt(pop
      .map(function (a) { return (a.fitness - mean) * (a.fitness - mean); })
      .reduce(function (a, b) { return a + b; }, 0) / pop.length);

    return {
      maximum: pop[0].fitness,
      minimum: pop[pop.length - 1].fitness,
      mean: mean,
      stdev: stdev
    };
  }

  seed() {
    return MIN_MAX_CONFIGS.map((min_max) => {
      return getRandom(min_max[0], min_max[1]);
    });
  }

  mutate(config) {
    const mutationIndex = getRandomInt(0, MIN_MAX_CONFIGS.length);
    return _.adjust((el) => { return getRandom(MIN_MAX_CONFIGS[mutationIndex][0], MIN_MAX_CONFIGS[mutationIndex][1]); }, mutationIndex, config);
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

  crossover(mother, father) {
    const son = [];
    const daughter = [];
    for (let i = 0; i < MIN_MAX_CONFIGS.length; i++) {
      const selector = getRandomInt(0, 2);
      if (selector === 0) {
        son.push(mother[i]);
        daughter.push(father[i]);
      } else {
        son.push(father[i]);
        daughter.push(mother[i]);
      }
    }
    return [son, daughter];
  }

  compute(config) {
    return this.bestLineSplit.calculateLineSplit(config);
  }

  fitness(config, computed) {
    return this.bestLineSplit.fitness(computed.linesHeight, computed.lineWidth);
  }

  replace(sortedGen) {
    return _.take(this.configuration.size, sortedGen);
  }

  optimizeFitness(a, b) {
    return a > b;
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
}

export default GeneticAlg;
