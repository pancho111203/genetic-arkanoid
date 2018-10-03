import * as _ from 'ramda';
import GeneticAlgorithmGeneric from './GeneticAlgorithmGeneric';
import Simulation from '../Simulation';
import { BALL_LIMITS } from '../globals';
import { getRandom, getRandomInt, workerLog } from './helpers';
//const DEFAULT_BALL = [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]];

const DEFAULT_OPTIONS = {
  size: 10,
  steps: 100,
  keepBest: true,
  timestep: 1 / 60,
  updatesPerTimestep: 300,
  maxBalls: 10,
  fixedNumberOfBalls: false
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

  removeRandomBallFromConfig(config) {
    const ind = getRandomInt(0, config.length);
    return _.remove(ind, 1, config);
  }

  addRandomBallToConfig(config) {
    const ball = this.createRandomBall();
    return _.append(ball, config);
  }

  mutate(config) {
    if (getRandom(0, 1) > 0.5) {
      config = this.removeRandomBallFromConfig(config);
    }
    if (getRandom(0, 1) > 0.5) {
      config = this.addRandomBallToConfig(config);
    }

    return config;
  }

  crossover(mother, father) {
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
      workerLog('STARTED SIMULATION with levelConfigs:');
      workerLog(levelConfigs);
      const timeStart = Date.now();
      simulation.onFinished((results) => {
        const timeEnd = Date.now();
        const timeTaken = timeEnd - timeStart;
        workerLog(`FINISHED SIMULATION after ${timeTaken/1000} seconds`);
        if (results.length !== gen.length) {
          reject('Invalid number of results returned');
        }
        const res = [];
        for (let i = 0; i < gen.length; i++) {
          const nrBalls = gen[i].config.length;
          const updatesRunningExecuted = results[i].updatesRunningExecuted;
          const finishedOnTimeout = results[i].finishedOnTimeout;
          let fitness;
          if (finishedOnTimeout) {
            fitness = 99999999999;
          } else {
            // TODO think of best fitness functions
            fitness = nrBalls * updatesRunningExecuted;
          }
          res.push({
            fitness,
            data: _.merge({ nrBalls }, results[i])
          });
        }
        resolve(res);
      });
      simulation.run();
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
