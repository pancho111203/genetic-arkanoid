import * as THREE from 'three';
import * as CANNON from 'cannon';
import ResourceLoader from '../ResourceLoader';
import GameObject from '../generics/GameObject';
import RigidBody from '../generics/RigidBody';
import { timeStep } from '../globals';
import keypressed from '../keypressed';
import CollisionDetector from '../generics/CollisionDetector';
import { STATES } from '../globals';


const BALL_RADIUS = 2.1;
const BALL_WIDTH_SEGMENTS = 64;
const BALL_HEIGHT_SEGMENTS = 64;
const BALL_SCALE = 1;

const SPEED = 1;

class Ball extends GameObject {
  constructor(game, name, initialDirection, initialPosition, color = 0x38e1ec) {
    super(game, name);

    if (initialDirection) {
      this.direction = initialDirection;
    } else {
      this.direction = new THREE.Vector3(-1, -1.2, 0).normalize();;
    }

    //    const geometry = new THREE.CylinderGeometry(10, 10, 30);
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, BALL_WIDTH_SEGMENTS, BALL_HEIGHT_SEGMENTS);
    const material = new THREE.MeshBasicMaterial({ color: color, envMap: game.scene.background });
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
    if (this.game.state === STATES.RUNNING) {
      this.arrowGrp.visible = false;

      const nextPositionOnThisDirection = this.mesh.position.clone();
      nextPositionOnThisDirection.add(this.direction);
      let [[collidesLeft, collidesRight, collidesDown, collidesUp], collisionObjects] = this.collisionDetector.checkCollisions(
        nextPositionOnThisDirection,
        [[new THREE.Vector3(-1, 0, 0), BALL_RADIUS],
        [new THREE.Vector3(1, 0, 0), BALL_RADIUS], 
        [new THREE.Vector3(0, -1, 0), BALL_RADIUS],
        [new THREE.Vector3(0, 1, 0), BALL_RADIUS]], this.game.scene.getObjectsOfGroups(['ballCollisions']))

      if (collidesLeft || collidesRight) {
        this.direction.x = -this.direction.x;
      }

      if (collidesDown || collidesUp) {
        this.direction.y = -this.direction.y
      }

      this.mesh.position.add(this.direction);

      const colObjs = collisionObjects.flat();
      // TODO limit colObjs to UNIQUE objects (to avoid repeating check 4 times)
      for (let colObj of colObjs) {
        if (colObj.isOfGroup('destroyable')) {
          this.game.destroy(colObj.userData.gameObject);
        }
      }
    } else {
      this.arrowGrp.visible = true;
    }

    if (this.arrowGrp.visible) {
      this.setArrowMatrix();
    }
  }
}

export default Ball;
