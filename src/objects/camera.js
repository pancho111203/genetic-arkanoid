import * as THREE from 'three';
import { OrbitControls } from 'three-full';

class Camera {
  constructor(renderer, scene, lightOn = false) {
    if (!window || !process.browser) {
      throw new Error('Cant create a camera if not in a browser environment (without rendering)');
    }
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 10000);
    this.camera.position.z = 100;

    this.frustum = new THREE.Frustum();
    this.cameraViewProjectionMatrix = new THREE.Matrix4();

    this.camera.name = 'MainCamera';

    if (lightOn) {
      this.light = new THREE.DirectionalLight( 0xffffff, 1 );
      this.light.name = 'camera Light';
      this.light.position.set( this.camera.position.x, this.camera.position.y, this.camera.position.z );
      this.light.rotation.set( this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z );
  
      // this.light.castShadow = true;
      // this.light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(100, 1, 500, 1000));
      // this.light.shadow.bias = 0.0001;
      // this.light.shadow.mapSize.width = 2048*2;
      // this.light.shadow.mapSize.height = 2048*2;
      scene.add(this.light);
    }

    const orbitControls = new OrbitControls(this.camera, renderer.domElement);
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
    if (this.light) {
      this.light.position.set( this.camera.position.x, this.camera.position.y, this.camera.position.z );
      this.light.rotation.set( this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z );
    }
  }
}

export default Camera;