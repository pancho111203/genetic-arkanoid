import * as THREE from 'three';
import ResourceLoader from '../ResourceLoader';
import GameObject from '../generics/GameObject';
import { STATES, debug } from '../globals';
import Ball from './ball';
import { tileHeight, tileWidth, tileDepth, wallWidth, nTilesV, nTilesH } from '../globals';

const PLANE_WIDTH = (nTilesH * tileWidth);
const PLANE_HEIGHT = 45;
const START_POSITION_Y = (-(nTilesV * tileHeight) / 2) + PLANE_HEIGHT / 2;

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
      const mouse = new THREE.Vector2(0, 0);
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      if (this.game.state === STATES.PLACING && this.mesh) {
        if (this.phase === PHASES.POSITION) {
          const raycaster = new THREE.Raycaster()
          raycaster.setFromCamera(mouse, window.WORLD.camera.camera)
          const intersections = raycaster.intersectObject(this.mesh);
          if (intersections && intersections.length > 0) {
            const intersectionPoint = intersections[0].point;
            const ball = new Ball(game, 'Ball', undefined, intersectionPoint.sub(this.game.scene.position));
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
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

    if (!debug) {
      material.visible = false;
    }
    const creatorPlane = new THREE.Mesh(geometry, material);
    creatorPlane.position.y = START_POSITION_Y;

    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, -1));

    this.loadMeshToScene(creatorPlane);
    this.loaded = true;
  }

  update() {
    if (this.game.state === STATES.PLACING && this.mesh && this.phase === PHASES.ROTATION && this.currentPlacingBall !== null && this.currentPlacingBall.loaded) {
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(this.game.mouse, window.WORLD.camera.camera)
      const intersection = raycaster.ray.intersectPlane(this.plane);
      if (intersection) {
        intersection.sub(this.game.scene.position); // make relative to current scene
        const directionVector = intersection.sub(this.currentPlacingBall.mesh.position).normalize();
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
