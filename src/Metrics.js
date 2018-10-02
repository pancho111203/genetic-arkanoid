import { STATES } from './globals';

const FINISH_TIMEOUT = 60000;

class Metrics {
  constructor(level) {
    this.isFinished = false;
    this.level = level;
    this.metrics = {
      updatesRunningExecuted: 0,
      bricksDestroyed: 0,
      finishedOnTimeout: false
    }

    this.callbacks = {
      onFinished: [],
      onBrickDestroyed: []
    };
  }

  onFinished(cb) {
    this.callbacks.onFinished.push(cb);
  }

  onBrickDestroyed(cb) {
    this.callbacks.onBrickDestroyed.push(cb);
  }

  setAsFinished() {
    for (let cb of this.callbacks.onFinished) {
      cb(this.metrics, this.level);
    }
    this.isFinished = true;
  }

  brickDestroyed() {
    this.metrics.bricksDestroyed = this.metrics.bricksDestroyed + 1;
    for (let cb of this.callbacks.onBrickDestroyed) {
      cb(this.metrics);
    }
  }

  update() {
    if (this.level.game.state === STATES.RUNNING && this.isFinished === false) {
      this.metrics.updatesRunningExecuted = this.metrics.updatesRunningExecuted + 1;
      if (this.metrics.updatesRunningExecuted >= FINISH_TIMEOUT) {
        this.metrics.finishedOnTimeout = true;
        this.setAsFinished();
      }
    }
  }
}

export default Metrics;