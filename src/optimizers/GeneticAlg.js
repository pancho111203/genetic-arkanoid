import * as _ from 'ramda';
import GeneticAlgorithmGeneric from './GeneticAlgorithmGeneric';
import Simulation from '../Simulation';
import { BALL_LIMITS } from '../globals';
import { getRandom, getRandomInt, workerLog, clone } from './helpers';
//const DEFAULT_BALL = [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]];


// const geneticOptions = {
//   level: 0,
//   size: 10,
//   steps: 100,
//   keepBest: true,
//   timestep: 1 / 60,
//   updatesPerTimestep: 500,
//   maxBalls: 10,
//   fixedNumberOfBalls: false,
//   mutationFunction: 0,
//   crossoverFunction: 0,
//   fitnessFunction: 0,
//   selectionOverTwo: true
// };

class GeneticAlg extends GeneticAlgorithmGeneric {
  constructor(level, options) {
    super(options);

    this.replaceFunctions = {
      0: (configs) => {
        return configs;
      },
      1: (configs) => {
        // in this one we add extra random configs to allow some variability (alert: added ones exceed size)
        const newConfigs = clone(configs);
        const randomlyAdded = 2;
        for (let i = 0; i < randomlyAdded; i++) {
          newConfigs.push(this.seed());
        }
        return newConfigs;
      }
    }

    this.mutationFunctions = {
      0: (config) => {
        if (getRandom(0, 1) > 0.5) {
          config = this.removeRandomBallFromConfig(config);
        }
        if (getRandom(0, 1) > 0.5) {
          config = this.addRandomBallToConfig(config);
        }

        return config;
      },
      1: (config) => {
        // Mutacion usada cuando fixedNumberOfBalls es true (no cambia el num de bolas)
        config = this.removeRandomBallFromConfig(config);
        config = this.addRandomBallToConfig(config);
        return config;
      }
    };

    this.crossoverFunctions = {
      0: (mother, father) => {
        const son = [];
        const daughter = [];
        for (let ball of _.concat(mother, father)) {
          if (getRandom(0, 1) > 0.5) {
            son.push(ball);
          } else {
            daughter.push(ball);
          }
        }
        return [son, daughter];
      },
      1: (mother, father) => {
        // Mutacion usada cuando fixedNumberOfBalls es true (no cambia el num de bolas)
        const son = [];
        const daughter = [];
        let parents = _.concat(mother, father);
        for (let i = 0; i < this.options.maxBalls; i++) {
          const index = getRandomInt(0, parents.length);
          const ball = parents[index];
          parents = _.remove(index, 1, parents);
          son.push(ball);
        }
        for (let i = 0; i < this.options.maxBalls; i++) {
          const index = getRandomInt(0, parents.length);
          const ball = parents[index];
          parents = _.remove(index, 1, parents);
          daughter.push(ball);
        }
        return [son, daughter];
      }
    };

    this.fitnessFunctions = {
      0: (simulationResult, config) => {
        const nrBalls = config.length;
        const updatesRunningExecuted = simulationResult.updatesRunningExecuted;
        const finishedOnTimeout = simulationResult.finishedOnTimeout;
        if (finishedOnTimeout) {
          return 99999999999;
        } else {
          return nrBalls * updatesRunningExecuted;
        }
      }
    };

    this.level = level;
  }

  createRandomBall() {
    const pos = [getRandom(BALL_LIMITS.limit_x_left, BALL_LIMITS.limit_x_right), getRandom(BALL_LIMITS.limit_y_bot, BALL_LIMITS.limit_y_top), 0];
    const dir = [getRandom(0, 1), getRandom(0, 1), 0];
    return [pos, dir];
  }

  select(pop) {
    if (this.options.selectionOverTwo) {
      const n = pop.length;
      const a = pop[Math.floor(Math.random() * n)];
      const b = pop[Math.floor(Math.random() * n)];
      let best = this.optimizeFitness(a.fitness, b.fitness) ? a : b;
      return best.config;
    } else {
      const n = pop.length;
      const a = pop[Math.floor(Math.random() * n)];
      const b = pop[Math.floor(Math.random() * n)];
      const c = pop[Math.floor(Math.random() * n)];
      let best = this.optimizeFitness(a.fitness, b.fitness) ? a : b;
      best = this.optimizeFitness(best.fitness, c.fitness) ? best : c;
      return best.config;
    }
  }

  seed() {
    const config = [];
    let num_balls;
    if (this.options.fixedNumberOfBalls) {
      num_balls = this.options.maxBalls;
    } else {
      num_balls = getRandomInt(1, this.options.maxBalls + 1);
    }
    
    for (let i = 0; i < num_balls; i++) {
      config.push(this.createRandomBall());
    }
    return config;
  }

  removeRandomBallFromConfig(config) {
    const ind = getRandomInt(0, config.length);
    return _.remove(ind, 1, config);
  }

  addRandomBallToConfig(config) {
    const ball = this.createRandomBall();
    return _.append(ball, config);
  }

  mutate(config) {
    return this.mutationFunctions[this.options.mutationFunction](config);
  }

  crossover(mother, father) {
    return this.crossoverFunctions[this.options.crossoverFunction](mother, father);
  }

  fitness(gen) {
    return new Promise((resolve, reject) => {
      const levelConfigs = gen.map((ind) => {
        return {
          levelNr: this.level,
          balls: ind.config
        };
      });
      const simulation = new Simulation(false, levelConfigs, this.options.timestep, this.options.updatesPerTimestep);
      simulation.onFinished((data) => {
        simulation.terminate();
        const results = data.metrics;
        if (results.length !== gen.length) {
          reject('Invalid number of results returned');
        }
        const res = [];
        for (let i = 0; i < gen.length; i++) {
          const config = gen[i].config;
          const simulationResult = results[i];

          const fitness = this.fitnessFunctions[this.options.fitnessFunction](simulationResult, config);

          res.push({
            fitness,
            data: _.merge({ nrBalls: config.length }, simulationResult)
          });
        }
        resolve(res);
      });
      simulation.run();
    });
  }

  replace(configs) {
    if (this.options.replaceFunction === undefined) {
      return this.replaceFunctions[0](configs);
    }
    return this.replaceFunctions[this.options.replaceFunction](configs);
  }

  optimizeFitness(a, b) {
    // if it returns true, a wil be considered better
    return a < b;
  }
}

export default GeneticAlg;
