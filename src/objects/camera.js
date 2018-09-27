import * as THREE from 'three';
import * as CANNON from 'cannon';
import GameObject from '../generics/GameObject';
import { timeStep } from '../globals';
import keypressed from '../keypressed';
import { OrbitControls } from 'three-full';

class Camera extends GameObject {
  constructor(game, name) {
    super(game, name);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 100;

    this.frustum = new THREE.Frustum();
    this.cameraViewProjectionMatrix = new THREE.Matrix4();

    this.camera.name = this.name;

    const orbitControls = new OrbitControls(this.camera);

    this.loaded = true;
  }

  pointIsOnCamera(point) {
    return this.frustum.containsPoint(point);
  }

  objectIsOnCamera(object) {
    for (let child of object.children) {
      if (this.objectIsOnCamera(child)) {
        return true;
      }
    }
    if (object.geometry) {
      return this.frustum.intersectsObject(object);
    }
    return false;
  }

  updateFrustum() {
    this.camera.updateMatrixWorld();
    this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
    this.cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromMatrix(this.cameraViewProjectionMatrix);
  }

  update() {
    this.updateFrustum();
  }
}

export default Camera;