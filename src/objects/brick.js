import * as THREE from 'three';
import ResourceLoader from '../ResourceLoader';
import GameObject from '../generics/GameObject';
import { tileHeight, tileWidth, tileDepth } from '../globals';

const BRICK_HEIGHT = tileHeight;
const BRICK_WIDTH = tileWidth;
const BRICK_DEPTH = tileDepth;

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
  constructor(game, name, startPositionTopLeft, tileType) {
    super(game, name);

    const geometry = new THREE.BoxGeometry(BRICK_WIDTH, BRICK_HEIGHT, BRICK_DEPTH);
    const rgbCodes = COLOR_MAP[tileType];
    const material = new THREE.MeshBasicMaterial( {color: new THREE.Color(`rgb(${rgbCodes[0]}, ${rgbCodes[1]}, ${rgbCodes[2]})`)} );
    const brick = new THREE.Mesh( geometry, material );
    brick.userData.groups = ['ballCollisions', 'destroyable'];

    if (startPositionTopLeft) {
      brick.position.set(startPositionTopLeft.x + BRICK_WIDTH/2, startPositionTopLeft.y - BRICK_HEIGHT/2, startPositionTopLeft.z);
    }
    
    this.loadMeshToScene(brick);
    this.loaded = true;
  }
}

export default Brick;
