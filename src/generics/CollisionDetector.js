import * as THREE from 'three';

class CollisionDetector {
  constructor(parent) {
    this.parent = parent;
    if (!this.parent.mesh) {
      throw new Error('Cant add a CollisionDetector on an object without a Mesh');
    }
  }

  checkCollisions(origin, directions, objects, recursive=true) {
    const isColliding = Array(directions.length).fill(false);
    const collisionObjects = Array(directions.length).fill([]);

    for (let directionIndex = 0; directionIndex < directions.length; directionIndex++) {
      const directionBundle = directions[directionIndex];
      const direction = directionBundle[0];
      const distance = directionBundle[1];
      const raycaster = new THREE.Raycaster(origin, direction.clone().normalize(), 0, distance);

      for (let obj of objects) {
        if (obj && obj.mesh) {
          const collisionResults = raycaster.intersectObject(obj.mesh, recursive);

          if (collisionResults.length > 0 && collisionResults[0].distance < distance) {
            collisionObjects[directionIndex].push(obj);
            isColliding[directionIndex] = true;
          }
        }
      }
    }

    return [isColliding, collisionObjects];
  }
}

export default CollisionDetector;