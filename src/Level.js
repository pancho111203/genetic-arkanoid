import * as THREE from 'three';
import Game from './Game';
import Walls from './objects/walls';
import LevelLoader from './objects/levelLoader';
import BallCreator from './objects/ballCreator';
import { STATES } from './globals';

class Level {
  constructor(levelNr, position) {
    this.position = position;
    this.levelNr = levelNr;
    this.initScene();
    this.initGame();
  }

  update() {
    for (let obj of this.game.objects) {
      if (obj.update && obj.loaded == true) {
        obj.update();
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
    window.WORLD.scene.remove(this.scene);
    this.scene = null;
    this.game = null;

    this.initScene();
    this.initGame();
  }

  initGame() {
    this.game = new Game(this.scene);

    this.walls = new Walls(this.game, 'Walls');
    this.game.add(this.walls);

    this.levelLoader = new LevelLoader(this.game, 'LevelLoader', this.levelNr);
    this.game.add(this.levelLoader);

    this.ballCreator = new BallCreator(this.game, 'BallCreator');
    this.ballCreator.id = 'ballCreator';
    this.game.add(this.ballCreator);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.name = 'Level ' + this.levelNr;
    if (this.position) {
      this.scene.position.set(this.position.x, this.position.y, this.position.z);
    } else {
      this.scene.position.set(0, 0, 0);
    }


    window.WORLD.scene.add(this.scene);
  }
}

export default Level;

