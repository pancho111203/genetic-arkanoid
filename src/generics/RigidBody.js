import { threeToCannon } from '../../lib/three-to-cannon';
import * as CANNON from 'cannon';

class RigidBody {
  constructor(parent, mass = 1) {
    this.parent = parent;
    if (!this.parent.mesh) {
      throw new Error('Cant add a RigidBody on an object without a Mesh');
    }
    const bodyShape = threeToCannon(this.parent.mesh);
    this.body = new CANNON.Body({ mass: mass, shape: bodyShape });
    this.body.position.set(this.parent.mesh.position.x, this.parent.mesh.position.y, this.parent.mesh.position.z);
    this.body.quaternion.set(this.parent.mesh.quaternion.x, this.parent.mesh.quaternion.y, this.parent.mesh.quaternion.z, this.parent.mesh.quaternion.w)
    this.parent.game.world.add(this.body);
  }

  update() {
    this.parent.mesh.position.x = this.body.position.x;
    this.parent.mesh.position.y = this.body.position.y;
    this.parent.mesh.position.z = this.body.position.z;
    this.parent.mesh.quaternion.x = this.body.quaternion.x;
    this.parent.mesh.quaternion.y = this.body.quaternion.y;
    this.parent.mesh.quaternion.z = this.body.quaternion.z;
    this.parent.mesh.quaternion.w = this.body.quaternion.w;
  }
}

export default RigidBody;