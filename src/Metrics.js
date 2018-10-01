import { STATES } from './globals';
class Metrics {
  constructor(level) {
    this.level = level;
    this.metrics = {
      updatesRunningExecuted: 0,
      bricksDestroyed: 0
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

  finished() {
    for (let cb of this.callbacks.onFinished) {
      cb(this.metrics);
    }
  }

  brickDestroyed() {
    this.metrics.bricksDestroyed = this.metrics.bricksDestroyed + 1;
    for (let cb of this.callbacks.onBrickDestroyed) {
      cb(this.metrics);
    }
  }

  update() {
    if (this.level.game.state === STATES.RUNNING) {
      this.metrics.updatesRunningExecuted = this.metrics.updatesRunningExecuted + 1;
    }
  }
}

export default Metrics;