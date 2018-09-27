import * as THREE from 'three';

class CollisionDetector {
  constructor(parent) {
    this.parent = parent;
    if (!this.parent.mesh) {
      throw new Error('Cant add a CollisionDetector on an object without a Mesh');
    }
  }

  checkCollisions(origin, directions, meshes, recursive=true) {
    const isColliding = Array(directions.length).fill(false);
    const collisionObjects = Array(directions.length).fill([]);

    for (let directionIndex = 0; directionIndex < directions.length; directionIndex++) {
      const directionBundle = directions[directionIndex];
      const direction = directionBundle[0];
      const distance = directionBundle[1];

      const position = origin.clone();
      position.add(this.parent.game.scene.position);
      const raycaster = new THREE.Raycaster(position, direction.clone().normalize(), 0, distance);

      for (let mesh of meshes) {
        if (mesh) {
          const collisionResults = raycaster.intersectObject(mesh, recursive);

          if (collisionResults.length > 0 && collisionResults[0].distance < distance) {
            collisionObjects[directionIndex].push(mesh);
            isColliding[directionIndex] = true;
          }
        }
      }
    }

    return [isColliding, collisionObjects];
  }
}

export default CollisionDetector;