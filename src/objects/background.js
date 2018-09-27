import * as THREE from 'three';
import ResourceLoader from '../ResourceLoader';
import GameObject from '../generics/GameObject';

class Background extends GameObject {
  constructor(game, name) {
    super(game, name);

    const cubeTexture = new THREE.CubeTextureLoader()
      .setPath('dist/textures/cube/skybox/')
      .load([
        'px.jpg',
        'nx.jpg',
        'py.jpg',
        'ny.jpg',
        'pz.jpg',
        'nz.jpg'
      ]);

    this.game.scene.background = cubeTexture;
    this.loaded = true;
  }
}

export default Background;
