import * as THREE from 'three';
import GameObject from '../generics/GameObject';
import CollisionDetector from '../generics/CollisionDetector';
import { STATES } from '../globals';


const BALL_RADIUS = 2.1;
const BALL_WIDTH_SEGMENTS = 64;
const BALL_HEIGHT_SEGMENTS = 64;
const BALL_SCALE = 1;

const SPEED = 1;

class Ball extends GameObject {
  constructor(level, name, initialDirection, initialPosition, color = 0x38e1ec) {
    super(level, name);

    if (initialDirection) {
      this.direction = initialDirection;
    } else {
      this.direction = new THREE.Vector3(-1, -1.2, 0).normalize();;
    }

    //    const geometry = new THREE.CylinderGeometry(10, 10, 30);
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, BALL_WIDTH_SEGMENTS, BALL_HEIGHT_SEGMENTS);
    const material = new THREE.MeshBasicMaterial({ color: color, envMap: this.level.parentSimulation.scene.background });
    const ball = new THREE.Mesh(geometry, material);

    this.arrowGrp = new THREE.Group();
    this.arrowGrp.name = 'Arrow';
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const arrowBase = new THREE.Mesh(new THREE.CylinderGeometry(BALL_RADIUS / 2, BALL_RADIUS / 2, BALL_RADIUS * 1.5), arrowMaterial);
    const arrowEdge = new THREE.Mesh(new THREE.CylinderGeometry(0, BALL_RADIUS, BALL_RADIUS), arrowMaterial);
    arrowEdge.position.y = BALL_RADIUS * 1;

    this.arrowGrp.add(arrowBase);
    this.arrowGrp.add(arrowEdge);

    this.arrowGrp.position.y = BALL_RADIUS * 1.5;

    this.mesh = new THREE.Group();
    this.mesh.add(ball);
    this.mesh.add(this.arrowGrp);

    this.mesh.scale.x = BALL_SCALE;
    this.mesh.scale.y = BALL_SCALE;
    this.mesh.scale.z = BALL_SCALE;

    if (initialPosition) {
      this.mesh.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
    } else {
      this.mesh.position.set(0, 20, 0);
    }

    this.loadMeshToScene(this.mesh);
    this.collisionDetector = new CollisionDetector(this);
    this.setArrowMatrix();
    this.loaded = true;
  }

  setArrowMatrix() {
    const pos = this.direction.clone().normalize();
    pos.multiplyScalar(2);
    this.arrowGrp.position.set(pos.x, pos.y, pos.z);

    const angle = new THREE.Vector3(0, 1, 0).angleTo(this.direction.clone().normalize());
    if (this.direction.x > 0) {
      this.arrowGrp.rotation.z = -angle;
    } else {
      this.arrowGrp.rotation.z = angle;
    }
  }

  update() {
    if (this.level.game.state === STATES.RUNNING) {
      this.arrowGrp.visible = false;

      const nextPositionOnThisDirection = this.mesh.position.clone();
      nextPositionOnThisDirection.add(this.direction);
      let [[collidesLeft, collidesRight, collidesDown, collidesUp, collidesDownLeft, collidesDownRight, collidesUpRight, collidesUpLeft], collisionObjects] = this.collisionDetector.checkCollisions(
        nextPositionOnThisDirection,
        [[new THREE.Vector3(-1, 0, 0), BALL_RADIUS],
        [new THREE.Vector3(1, 0, 0), BALL_RADIUS], 
        [new THREE.Vector3(0, -1, 0), BALL_RADIUS],
        [new THREE.Vector3(0, 1, 0), BALL_RADIUS],
        [new THREE.Vector3(-1, -1, 0), BALL_RADIUS],
        [new THREE.Vector3(1, -1, 0), BALL_RADIUS], 
        [new THREE.Vector3(1, 1, 0), BALL_RADIUS],
        [new THREE.Vector3(-1, 1, 0), BALL_RADIUS],], this.level.scene.getObjectsOfGroups(['ballCollisions']))

      const changeDirHorizontal = (collidesLeft || (collidesUpLeft && collidesDownLeft)) || (collidesRight || (collidesUpRight && collidesDownRight));
      const changeDirVertical = (collidesUp || (collidesUpLeft && collidesUpRight)) || (collidesDown || (collidesDownLeft && collidesDownRight));
      
      if (changeDirVertical || changeDirHorizontal) {
        if (changeDirHorizontal) {
          this.direction.x = -this.direction.x;
        }
  
        if (changeDirVertical) {
          this.direction.y = -this.direction.y;
        }
      } else {
        // edge cases
        if (collidesDownLeft) {
          this.direction.x = Math.abs(this.direction.x);
          this.direction.y = Math.abs(this.direction.y);
        } else if (collidesUpLeft) {
          this.direction.x = Math.abs(this.direction.x);
          this.direction.y = -Math.abs(this.direction.y);
        } else if (collidesDownRight) {
          this.direction.x = -Math.abs(this.direction.x);
          this.direction.y = Math.abs(this.direction.y);
        } else if (collidesUpRight) {
          this.direction.x = -Math.abs(this.direction.x);
          this.direction.y = -Math.abs(this.direction.y);
        }
      }

      this.mesh.position.add(this.direction);

      const colObjs = collisionObjects.flat();
      // TODO limit colObjs to UNIQUE objects (to avoid repeating check 4 times)
      for (let colObj of colObjs) {
        if (colObj.isOfGroup('destroyable')) {
          this.level.game.destroy(colObj.userData.gameObject);
        }
      }
//      console.log([collidesLeft, collidesRight, collidesDown, collidesUp, collidesDownLeft, collidesDownRight, collidesUpRight, collidesUpLeft], collisionObjects);
    } else {
      this.arrowGrp.visible = true;
    }

    if (this.arrowGrp.visible) {
      this.setArrowMatrix();
    }
  }
}

export default Ball;
