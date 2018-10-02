import * as THREE from 'three';
import GameObject from '../generics/GameObject';
import { STATES, debug } from '../globals';
import Ball from './ball';
import { validateBallConfiguration } from '../globals';

class BallSetter extends GameObject {
  constructor(level, name, ballsConfiguration) {
    super(level, name);

    for (let ballConfiguration of ballsConfiguration) {
      const ballPosition = new THREE.Vector3(ballConfiguration[0][0], ballConfiguration[0][1], ballConfiguration[0][2]);
      const ballDirection = new THREE.Vector3(ballConfiguration[1][0], ballConfiguration[1][1], ballConfiguration[1][2]).normalize();

      const validation = validateBallConfiguration(ballPosition, ballDirection);
      if(validation === null) {
        const ball = new Ball(this.level, 'Ball', ballDirection, ballPosition);
        this.level.game.add(ball);
      } else {
        console.error('Tried to add invalid ball configuration: ' + validation);
        console.error(ballConfiguration);
      }
    }

    this.loaded = true;
  }
}

export default BallSetter;
