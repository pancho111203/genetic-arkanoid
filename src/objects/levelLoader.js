import * as THREE from 'three';
import ResourceLoader from '../ResourceLoader';
import GameObject from '../generics/GameObject';
import { STATES, debug } from '../globals';
import * as PNGReader from 'pngjs';
import levelsJson from '../../dist/images/arkanoid_levels.json';
import { tileHeight, tileWidth, tileDepth, nTilesH, nTilesV } from '../globals';
import Brick from './brick';

class LevelLoader extends GameObject {
  constructor(game, name, startLevel=0) {
    super(game, name);
    this.level = startLevel;
    this.loadLevel(this.level);
    this.loaded = true;
  }

  changeLevel(level) {
    // TODO implement changing level (including cleaning old level etc)
    throw new Error('Not implemented');
  }

  loadLevel(level) {
    console.log('Loading level: ' + level);
    const distribution = levelsJson[level];
    for (let x = 0; x < nTilesH; x++) {
      for (let y = 0; y < nTilesV; y++) {
        const tileType = distribution[y * nTilesH + x];

        if (tileType > 0) {
          const startX = -(nTilesH * tileWidth) / 2;
          const startY = (nTilesV * tileHeight) / 2;
  
  
          const startPosition = new THREE.Vector3(startX + x * tileWidth, startY - y * tileHeight, 0); // top left corner of where the brick should be painted
          const brick = new Brick(this.game, 'Brick', startPosition, tileType);
          brick.groups = ['ballCollisions', 'destroyable'];
          this.game.add(brick);
        }
      }
    }
  }

  update() {

  }
}

export default LevelLoader;
