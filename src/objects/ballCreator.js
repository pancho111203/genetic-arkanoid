import * as THREE from 'three';
import ResourceLoader from '../ResourceLoader';
import GameObject from '../generics/GameObject';
import { STATES, debug } from '../globals';
import Ball from './ball';

const START_POSITION_Y = -20;
const PLANE_WIDTH = 85;
const PLANE_HEIGHT = 45;

const PHASES = {
  POSITION: 0,
  ROTATION: 1
};

class BallCreator extends GameObject {
  constructor(game, name) {
    super(game, name);

    this.phase = PHASES.POSITION;
    this.currentPlacingBall = null;

    this.clickEvent = window.addEventListener('click', (event) => {
      if (this.game.state === STATES.PLACING && this.mesh) {
        if (this.phase === PHASES.POSITION) {
          const raycaster = new THREE.Raycaster()
          raycaster.setFromCamera(this.game.mouse, this.game.getObjectByName('camera').camera)
          const intersections = raycaster.intersectObject(this.mesh);
          if (intersections && intersections.length > 0) {
            const intersectionPoint = intersections[0].point;
            const ball = new Ball(game, 'Ball', undefined, intersectionPoint);
            this.game.add(ball);
            this.phase = PHASES.ROTATION;
            this.currentPlacingBall = ball;
          }
        } else {
          this.phase = PHASES.POSITION;
          this.currentPlacingBall = null;
        }
      }
    }, false);

    const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    if (!debug) {
      material.visible = false;
    }
    const creatorPlane = new THREE.Mesh(geometry, material);
    creatorPlane.position.y = START_POSITION_Y;
    this.loadMeshToScene(creatorPlane);
    this.loaded = true;

    this.loaded = true;
  }

  update() {
    if (this.game.state === STATES.PLACING && this.mesh && this.phase === PHASES.ROTATION && this.currentPlacingBall !== null && this.currentPlacingBall.loaded) {
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(this.game.mouse, this.game.getObjectByName('camera').camera)
      const intersections = raycaster.intersectObject(this.mesh);
      if (intersections && intersections.length > 0) {
        const intersectionPoint = intersections[0].point;
        const directionVector = intersectionPoint.sub(this.currentPlacingBall.mesh.position).normalize();
        this.currentPlacingBall.direction = directionVector;
      }
    }
  }

  destroy() {
    if (this.mesh) {
      this.game.scene.remove(this.mesh);
    }
    window.removeEventListener('click', this.clickEvent);
  }
}

export default BallCreator;
