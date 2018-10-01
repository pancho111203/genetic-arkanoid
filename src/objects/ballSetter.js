import * as THREE from 'three';
import GameObject from '../generics/GameObject';
import { STATES, debug } from '../globals';
import Ball from './ball';
import { tileHeight, tileWidth, tileDepth, wallWidth, nTilesV, nTilesH } from '../globals';

const PLANE_WIDTH = (nTilesH * tileWidth);
const PLANE_HEIGHT = 45;
const START_POSITION_Y = (-(nTilesV * tileHeight) / 2) + PLANE_HEIGHT / 2;

console.log(PLANE_WIDTH, PLANE_HEIGHT, START_POSITION_Y);


class BallSetter extends GameObject {
  constructor(game, name, ballsConfiguration) {
    super(game, name);

    for (let ballConfiguration of ballsConfiguration) {
      const ballPosition = new THREE.Vector3(ballConfiguration[0][0], ballConfiguration[0][1], ballConfiguration[0][2]);
      const ballDirection = new THREE.Vector3(ballConfiguration[1][0], ballConfiguration[1][1], ballConfiguration[1][2]).normalize();

      const validation = this.validateBallConfiguration(ballPosition, ballDirection);
      if(validation === null) {
        const ball = new Ball(game, 'Ball', ballDirection, ballPosition);
        this.game.add(ball);
      } else {
        console.error('Tried to add invalid ball configuration: ' + validation);
        console.error(ballConfiguration);
      }
    }

    this.loaded = true;
  }
  
  validateBallConfiguration(ballPosition, ballDirection) {
    if (ballPosition.z !== 0) {
      return 'position.z should always be 0';
    }

    const limit_y_top = START_POSITION_Y + (PLANE_HEIGHT / 2);
    const limit_y_bot = START_POSITION_Y - (PLANE_HEIGHT / 2);
    const limit_x_left = -PLANE_WIDTH / 2;
    const limit_x_right = PLANE_WIDTH / 2;
    if (ballPosition.x < limit_x_left) {
      return 'ball exceeds limit to the left';
    }
    if (ballPosition.x > limit_x_right) {
      return 'ball exceeds limit to the right';
    }
    if (ballPosition.y > limit_y_top) {
      return 'ball exceeds limit to the top';
    }
    if (ballPosition.y < limit_y_bot) {
      return 'ball exceeds limit to the bottom';
    }

    return null;
  }
}

export default BallSetter;
