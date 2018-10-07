import * as THREE from 'three';
import GameObject from '../generics/GameObject';
import { tileHeight, tileWidth, tileDepth } from '../globals';
import { textures } from '../visuals';

const BRICK_HEIGHT = tileHeight;
const BRICK_WIDTH = tileWidth;
const BRICK_DEPTH = tileDepth - 0.6;

const COLOR_MAP = [
  null,
  [252, 252, 252],
  [252, 116, 96],
  [60, 188, 252],
  [128, 208, 16],
  [216, 40, 0],
  [0, 112, 236],
  [252, 116, 180],
  [252, 152, 56],
  [188, 188, 188],
  [240, 188, 60]
]

class Brick extends GameObject {
  constructor(level, name, startPositionTopLeft, tileType, onDestroyedCb) {
    super(level, name);

    this.onDestroyedCb = onDestroyedCb;
    if (level.parentSimulation.rendering) {
      level.parentSimulation.resourceLoader.load([[textures.bricks[tileType], 'texture']]).then((resources) => {
        const texture = resources[0];
        //      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        const rpt = 3;
        //      texture.repeat.set(rpt, rpt*0.5);
        //      texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

        const geometry = new THREE.BoxGeometry(BRICK_WIDTH, BRICK_HEIGHT, BRICK_DEPTH);
        const brick = new THREE.Mesh(geometry, material);
        brick.userData.groups = ['ballCollisions', 'destroyable'];

        if (startPositionTopLeft) {
          brick.position.set(startPositionTopLeft.x + BRICK_WIDTH / 2, startPositionTopLeft.y - BRICK_HEIGHT / 2, startPositionTopLeft.z);
        }

        this.loadMeshToScene(brick);
        this.loaded = true;
      });
    } else {
      const rgbCodes = COLOR_MAP[tileType];
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(`rgb(${rgbCodes[0]}, ${rgbCodes[1]}, ${rgbCodes[2]})`) });
      const geometry = new THREE.BoxGeometry(BRICK_WIDTH, BRICK_HEIGHT, BRICK_DEPTH);
      const brick = new THREE.Mesh(geometry, material);
      brick.userData.groups = ['ballCollisions', 'destroyable'];

      if (startPositionTopLeft) {
        brick.position.set(startPositionTopLeft.x + BRICK_WIDTH / 2, startPositionTopLeft.y - BRICK_HEIGHT / 2, startPositionTopLeft.z);
      }

      this.loadMeshToScene(brick);
      this.loaded = true;
    }
  }

  destroy() {
    if (this.mesh) {
      this.level.metrics.brickDestroyed();

      if (this.onDestroyedCb) {
        this.onDestroyedCb();
      }

      this.level.scene.remove(this.mesh);
    }
  }
}

export default Brick;
