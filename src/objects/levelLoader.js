import * as THREE from 'three';
import GameObject from '../generics/GameObject';
import { STATES, debug } from '../globals';
import * as PNGReader from 'pngjs';
import levelsJson from '../../dist/images/arkanoid_levels.json';
import { tileHeight, tileWidth, tileDepth, nTilesH, nTilesV } from '../globals';
import Brick from './brick';

class LevelLoader extends GameObject {
  constructor(level, name, startLevel=0) {
    super(level, name);

    this.trackedBricksDestroyed = {};
    this.levelNr = startLevel;
    this.loadLevel(this.levelNr);
    this.loaded = true;
  }

  loadLevel(levelNr) {
    function genArrowFunc(this_, tId) {
      return () => { this_.setAsDestroyed(tId) }
    }

    const distribution = levelsJson[levelNr];
    let trackingId = 0;
    for (let x = 0; x < nTilesH; x++) {
      for (let y = 0; y < nTilesV; y++) {
        const tileType = distribution[y * nTilesH + x];

        if (tileType > 0) {
          const startX = -(nTilesH * tileWidth) / 2;
          const startY = (nTilesV * tileHeight) / 2;
  
          const this_ = this;
          const startPosition = new THREE.Vector3(startX + x * tileWidth, startY - y * tileHeight, 0); // top left corner of where the brick should be painted
          const brick = new Brick(this.level, 'Brick', startPosition, tileType, genArrowFunc(this_, trackingId));
          this.level.game.add(brick);
          this.trackedBricksDestroyed[trackingId] = false;
        }
        trackingId++;
      }
    }
  }

  setAsDestroyed(trackingId) {
    this.trackedBricksDestroyed[trackingId] = true;
    if(this.areAllBricksDestroyed()) {
      this.level.metrics.setAsFinished();
    }
  }

  areAllBricksDestroyed() {
    return Object.values(this.trackedBricksDestroyed).every((v) => v);
  }

  update() {

  }
}

export default LevelLoader;
