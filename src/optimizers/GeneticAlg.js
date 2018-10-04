import * as _ from 'ramda';
import GeneticAlgorithmGeneric from './GeneticAlgorithmGeneric';
import Simulation from '../Simulation';
import { BALL_LIMITS } from '../globals';
import { getRandom, getRandomInt, workerLog } from './helpers';
//const DEFAULT_BALL = [[[-34.09, -25.18, 0], [-0.67, 0.74, 0]]];

class GeneticAlg extends GeneticAlgorithmGeneric {
  constructor(level, options) {
    super(options);

    this.mutationFunctions = {
      0: (config) => {
        if (getRandom(0, 1) > 0.5) {
          config = this.removeRandomBallFromConfig(config);
        }
        if (getRandom(0, 1) > 0.5) {
          config = this.addRandomBallToConfig(config);
        }

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
      workerLog('STARTED SIMULATION with levelConfigs:');
      workerLog(levelConfigs);
      simulation.onFinished((data) => {
        simulation.terminate();
        const results = data.metrics;
        workerLog(`FINISHED SIMULATION after ${data.secondsTaken} seconds`);
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

  replace(sortedGen) {
    return _.take(this.options.size, sortedGen);
  }

  optimizeFitness(a, b) {
    // if it returns true, a wil be considered better
    return a < b;
  }
}

export default GeneticAlg;
