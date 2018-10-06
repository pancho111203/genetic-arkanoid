import * as THREE from 'three';
import GameObject from '../generics/GameObject';
import { tileHeight, tileWidth, tileDepth, wallWidth, nTilesV, nTilesH } from '../globals';
import { textures } from '../visuals';

const WALLS_HEIGHT = (nTilesV * tileHeight) + (wallWidth * 2);
const WALLS_WIDTH = (nTilesH * tileWidth) + (wallWidth * 2);
const WALLS_DEPTH = tileDepth;
const WALLS_THICKNESS = wallWidth;

class Walls extends GameObject {
  constructor(level, name) {
    super(level, name);

    if (level.parentSimulation.rendering) {
      level.parentSimulation.resourceLoader.load([[textures.walls, 'texture'], [textures.back, 'texture']]).then((resources) => {
        const wallsTexture = resources[0];
//        wallsTexture.image.width = 128;
//        wallsTexture.image.height = 128;
        wallsTexture.wrapS = wallsTexture.wrapT = THREE.RepeatWrapping;

        const textureVertical = wallsTexture.clone();
        const rpt1 = 1;
        textureVertical.repeat.set(rpt1, rpt1*30);
        textureVertical.needsUpdate = true;
        const materialVertical = new THREE.MeshBasicMaterial({ map: textureVertical });

        const textureHorizontal = wallsTexture.clone();
        textureHorizontal.repeat.set(rpt1*30, rpt1);
        textureHorizontal.needsUpdate = true;
        const materialHorizontal = new THREE.MeshBasicMaterial({ map: textureHorizontal });



        const backTexture = resources[1];
        backTexture.wrapS = backTexture.wrapT = THREE.RepeatWrapping;
        const rpt = 20;
        backTexture.repeat.set(rpt, rpt*1.25);
        backTexture.needsUpdate = true;

        const materialBack = new THREE.MeshBasicMaterial({ map: backTexture, side: THREE.DoubleSide });

        const mesh = this.createMesh(materialVertical, materialHorizontal, materialBack);
        this.loadMeshToScene(mesh);
        this.loaded = true;
      });
    } else {
      const materialBack = new THREE.MeshBasicMaterial({ color: 'yellow', side: THREE.DoubleSide });
      const material = new THREE.MeshBasicMaterial({ color: 'red' });
      const mesh = this.createMesh(material, material, materialBack);
      this.loadMeshToScene(mesh);
      this.loaded = true;
    }
  }

  createMesh(materialVertical, materialHorizontal, materialBack) {
    const wallsGroup = new THREE.Group();
    const left = new THREE.Mesh(new THREE.BoxGeometry(WALLS_THICKNESS, WALLS_HEIGHT, WALLS_DEPTH), materialVertical);
    left.name = 'Left';
    left.position.x = wallsGroup.position.x - (WALLS_WIDTH / 2 - WALLS_THICKNESS / 2);
    wallsGroup.add(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(WALLS_THICKNESS, WALLS_HEIGHT, WALLS_DEPTH), materialVertical);
    right.name = 'Right';
    right.position.x = wallsGroup.position.x + (WALLS_WIDTH / 2 - WALLS_THICKNESS / 2);
    wallsGroup.add(right);

    const top = new THREE.Mesh(new THREE.BoxGeometry(WALLS_WIDTH, WALLS_THICKNESS, WALLS_DEPTH), materialHorizontal);
    top.name = 'Top';
    top.position.y = wallsGroup.position.y + (WALLS_HEIGHT / 2 - WALLS_THICKNESS / 2);
    wallsGroup.add(top);

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(WALLS_WIDTH, WALLS_THICKNESS, WALLS_DEPTH), materialHorizontal);
    bottom.name = 'Bottom';
    bottom.position.y = wallsGroup.position.y - (WALLS_HEIGHT / 2 - WALLS_THICKNESS / 2);
    wallsGroup.add(bottom);

    wallsGroup.userData.groups = ['ballCollisions'];


    const back = new THREE.Mesh(new THREE.PlaneGeometry(WALLS_WIDTH, WALLS_HEIGHT), materialBack);
    back.position.z = (-WALLS_DEPTH / 2) + 0.2;
    const wallsAndBack = new THREE.Group();
    wallsAndBack.add(wallsGroup);
    wallsAndBack.add(back);

    return wallsAndBack;
  }
}

export default Walls;
