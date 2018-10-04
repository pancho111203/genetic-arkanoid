import _ from 'ramda';
import { BALL_LIMITS } from '../globals';
import { getRandom, getRandomInt, workerLog, clone } from './helpers';

// this.options = {
//   initialTemperature: 100,
//   maxIterations: 100000,
//   coolingFactor: 0.9,
//   timestep: 1 / 60,
//   updatesPerTimestep: 500,
//   fitnessFunction: 0,
//   successorFunction: 0,
//   coolingFunction: 0
// }

class SimmulatedAnnealing {
  constructor(level, options) {
    this.level = level;
    this.options = options;
    this.generationCallbacks = [];

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

    this.coolingFunctions = {
      0: (iteration, temperature) => {
        // a) α(i, T) = k*Ti, con 0<k<1, típicamente {0,8, 0,99}
        return this.options.coolingFactor * temperature;
      },
      1: (iteration, temperature) => {
        //b) α (i, T) = Ti/ (1 + kTi), k>0 y con valor pequeño. 
        // const coolingFactor = 0.1;
        return temperature / (1 + (this.options.coolingFactor * temperature));
      }
    }

    this.successorFunctions = {
      0: (config) => {
        if (getRandom(0, 1) > 0.5) {
          config = this.removeRandomBallFromConfig(config);
        }
        if (getRandom(0, 1) > 0.5) {
          config = this.addRandomBallToConfig(config);
        }

        return config;
      }
    }

    this.shouldEnd = false;
  }

  terminate = () => {
    this.shouldEnd = true;
  }

  addGenerationCallback = (cb) => {
    this.generationCallbacks.push(cb);
  }

  generateIndividual = (config) => {
    return new Promise((resolve, reject) => {
      const levelConfig = [{ levelNr: this.level, balls: config }];
      const simulation = new Simulation(false, levelConfig, this.options.timestep, this.options.updatesPerTimestep);
      simulation.onFinished((data) => {
        simulation.terminate();
        const results = data.metrics;
        if (results.length !== 1) {
          reject('Invalid number of results returned');
        }
        const simulationResult = results[0];
        const fitness = this.fitnessFunctions[this.options.fitnessFunction](simulationResult, config);
        const individual = {
          config,
          fitness,
          data: _merge({ nrBalls: config.length }, simulationResult)
        };

        resolve(individual);
      });
      simulation.run();
    });
  }
  async start(initialIndividual) {
    let currentIndividual;
    if (initialIndividual) {
      currentIndividual = await this.generateIndividual(initialIndividual);
    } else {
      currentIndividual = await this.generateIndividual(this.seed());
    }

    let bestIndividual = currentIndividual;
    //    this.foundNewBest(bestIndividual); ????????
    let temperature = this.options.initialTemperature;

    // TODO make it stop if bestInd didnt change in last x iterations??
    for (let i = 0; this.shouldContinue(i, temperature); i++) {
      const successor = await this.generateIndividual(this.generateSuccessor(currentIndividual.config));
      const delta = currentIndividual.fitness - successor.fitness;
      if (delta < 0) {
        currentIndividual = successor;
      } else {
        if (this.shouldAcceptSuccessor(temperature, delta)) {
          currentIndividual = successor;
        }
        temperature = this.coolTemperature(i, temperature);
      }
      if (bestIndividual.fitness < currentIndividual.fitness) {
        bestIndividual = currentIndividual;
        this.foundNewBest(bestIndividual);
      }
    }

    this.sendFinished();
  }

  shouldContinue = (iteration, temperature) => {
    if (iteration < this.options.maxIterations && !this.shouldEnd) {
      return true;
    }
    return false;
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


  createRandomBall() {
    const pos = [getRandom(BALL_LIMITS.limit_x_left, BALL_LIMITS.limit_x_right), getRandom(BALL_LIMITS.limit_y_bot, BALL_LIMITS.limit_y_top), 0];
    const dir = [getRandom(0, 1), getRandom(0, 1), 0];
    return [pos, dir];
  }

  removeRandomBallFromConfig(config) {
    const ind = getRandomInt(0, config.length);
    return _.remove(ind, 1, config);
  }

  addRandomBallToConfig(config) {
    const ball = this.createRandomBall();
    return _.append(ball, config);
  }

  shouldAcceptSuccessor = (temperature, delta) => {
    var C = Math.exp(-delta / temperature);
    var R = Math.random();

    if (R < C) {
      return true;
    }

    return false;
  }

  generateSuccessor = (config) => {
    return this.successorFunctions[this.options.successorFunction](config);
  }

coolTemperature = (iteration, temperature) => {
  return this.coolingFunctions[this.options.coolingFunction](iteration, temperature);
}

foundNewBest = (individual) => {
  if (this.shouldEnd) return;
  const stats = {};
  this.generationCallbacks.forEach((cb) => {
    cb(individual, stats);
  });
}

sendFinished = () => {
  this.generationCallbacks.forEach((cb) => {
    cb(null, null, true);
  });
}
}

export default SimmulatedAnnealing;
