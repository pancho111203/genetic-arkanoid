import * as _ from 'ramda';
import GeneticAlgorithmGeneric from './GeneticAlgorithmGeneric';
import Simulation from '../Simulation';
import { BALL_LIMITS } from '../globals';
import { getRandom, getRandomInt } from './helpers';
//const DEFAULT_BALL = [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]];

const DEFAULT_OPTIONS = {
  size: 10,
  steps: 10,
  keepBest: true,
  timestep: 1/60,
  updatesPerTimestep: 300,
  maxBalls: 10
}

class GeneticAlg extends GeneticAlgorithmGeneric {
  constructor(level, options = DEFAULT_OPTIONS) {
    super(options);

    this.level = level;
  }

  createRandomBall() {
    const pos = [getRandom(BALL_LIMITS.limit_x_left, BALL_LIMITS.limit_x_right), getRandom(BALL_LIMITS.limit_y_bot, BALL_LIMITS.limit_y_top), 0];
    const dir = [getRandom(0, 1), getRandom(0, 1), 0];
    return [pos, dir];
  }

  seed() {
    const config = [];
    const num_balls = getRandomInt(1, this.options.maxBalls + 1);
    for (let i = 0; i < num_balls; i++) {
      config.push(this.createRandomBall());
    }
    return config;
  }

  mutate(config) {
    return config;
    // const mutationIndex = getRandomInt(0, MIN_MAX_CONFIGS.length);
    // return _.adjust((el) => { return getRandom(MIN_MAX_CONFIGS[mutationIndex][0], MIN_MAX_CONFIGS[mutationIndex][1]); }, mutationIndex, config);
  }

  crossover(mother, father) {
    return [mother, father];
    // const son = [];
    // const daughter = [];
    // for (let i = 0; i < MIN_MAX_CONFIGS.length; i++) {
    //   const selector = getRandomInt(0, 2);
    //   if (selector === 0) {
    //     son.push(mother[i]);
    //     daughter.push(father[i]);
    //   } else {
    //     son.push(father[i]);
    //     daughter.push(mother[i]);
    //   }
    // }
    // return [son, daughter];
  }

  fitness(config) {
    return new Promise((resolve, reject) => {
      const simulation = new Simulation(false, config, this.options.timestep, this.options.updatesPerTimestep);
      simulation.onFinished((results) => {
        if (results.length !== config.length) {
          reject('Invalid number of results returned');
        }
        const fitnesses = [];
        for (let i = 0; i < config.length; i++) {
          const nrBalls = config[i].length;
          const updatesRunningExecuted = results[i].updatesRunningExecuted;
          const finishedOnTimeout = results[i].finishedOnTimeout;

          if (finishedOnTimeout) {
            fitness = 99999999999;
          } else {
            // TODO think of best fitness functions
            fitness = nrBalls * nrBalls * updatesRunningExecuted;
          }
          fitnesses.push(fitness);
        }
        resolve(fitnesses);
      });
    });
  }

  replace(sortedGen) {
    return _.take(this.options.size, sortedGen);
  }

  optimizeFitness(a, b) {
    // if it returns true, a wil be considered better
    return a < b;
  }
}

export default GeneticAlg;
