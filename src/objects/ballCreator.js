import * as THREE from 'three';
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
  constructor(level, name) {
    super(level, name);
    if (!window || !process.browser) {
      throw new Error('Cant create a BallCreator if not in a browser environment (without rendering)');
    }

    this.phase = PHASES.POSITION;
    this.currentPlacingBall = null;

    this.clickEvent = window.addEventListener('click', (event) => {
      const mouse = new THREE.Vector2(0, 0);
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      if (this.level.game.state === STATES.PLACING && this.mesh) {
        if (this.phase === PHASES.POSITION) {
          const raycaster = new THREE.Raycaster()
          raycaster.setFromCamera(mouse, this.level.parentSimulation.camera.camera)
          const intersections = raycaster.intersectObject(this.mesh);
          if (intersections && intersections.length > 0) {
            const intersectionPoint = intersections[0].point;
            intersectionPoint.sub(this.level.scene.position);
            console.log(intersectionPoint);
            const ball = new Ball(this.level, 'Ball', undefined, intersectionPoint);
            this.level.game.add(ball);
            this.phase = PHASES.ROTATION;
            this.currentPlacingBall = ball;
          }
        } else {
          console.log(this.currentPlacingBall.direction);
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
    if (this.level.game.state === STATES.PLACING && this.mesh && this.phase === PHASES.ROTATION && this.currentPlacingBall !== null && this.currentPlacingBall.loaded) {
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(this.level.game.mouse, this.level.parentSimulation.camera.camera)
      const intersection = raycaster.ray.intersectPlane(this.plane);
      if (intersection) {
        intersection.sub(this.level.scene.position); // make relative to current scene
        const directionVector = intersection.sub(this.currentPlacingBall.mesh.position).normalize();
        this.currentPlacingBall.direction = directionVector;
      }
    }
  }

  destroy() {
    if (this.mesh) {
      this.level.scene.remove(this.mesh);
    }
    window.removeEventListener('click', this.clickEvent);
  }
}

export default BallCreator;
