import * as THREE from 'three';
import Game from './Game';
import Walls from './objects/walls';
import LevelLoader from './objects/levelLoader';
import BallCreator from './objects/ballCreator';
import BallSetter from './objects/ballSetter';
import Metrics from './Metrics';
import { STATES } from './globals';

class Level {
  constructor(simulation, levelNr, position, ballsConfiguration) {
    this.ballsConfiguration = ballsConfiguration;
    this.position = position;
    this.levelNr = levelNr;
    this.parentSimulation = simulation;
    this.metrics = new Metrics(this);
    this.start();
  }

  update() {
    if (!this.metrics.isFinished) {
      this.metrics.update();
      for (let obj of this.game.objects) {
        if (obj.update && obj.loaded == true) {
          obj.update();
        }
      }
    }
  }

  run() {
    this.game.changeState(STATES.RUNNING);
  }

  pause() {
    this.game.changeState(STATES.PLACING);
  }

  reset() {
    this.destroy();
    this.start();
  }

  destroy() {
    this.parentSimulation.scene.remove(this.scene);
    this.scene = null;
    this.game = null;
  }

  start() {
    this.metrics.resetMetrics();
    this.initScene();
    this.initGame();
  }

  initGame() {
    this.game = new Game(this);

    this.walls = new Walls(this, 'Walls');
    this.game.add(this.walls);

    this.levelLoader = new LevelLoader(this, 'LevelLoader', this.levelNr);
    this.game.add(this.levelLoader);

    if (this.parentSimulation.rendering) {
      this.ballCreator = new BallCreator(this, 'BallCreator');
      this.ballCreator.id = 'ballCreator';
      this.game.add(this.ballCreator);
    }

    if (this.ballsConfiguration !== undefined) {
      this.ballSetter = new BallSetter(this, 'BallSetter', this.ballsConfiguration);
      this.ballSetter.id = 'ballSetter';
      this.game.add(this.ballSetter);
    }

    // this.ball = new Ball(this);
    // this.game.add(this.ball);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.name = 'Level ' + this.levelNr;
    if (this.position) {
      this.scene.position.set(this.position.x, this.position.y, this.position.z);
    } else {
      this.scene.position.set(0, 0, 0);
    }


    this.parentSimulation.scene.add(this.scene);
  }
}

export default Level;

