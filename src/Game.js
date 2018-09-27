import { STATES } from './globals';

class Game {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.objects = [];
    this.names = {};
    this.groups = {};
    this.mouse = new THREE.Vector2();

    this.mouseMoveEvent = window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    });
    
    this.state = STATES.PLACING;
  }

  changeState(state) {
    this.state = state;
  }

  add(obj) {
    if (obj.id) {
      if (this.names[obj.id]!==undefined) {
        throw new Error('Trying to add GameObject with a repeated id');
      }
      this.names[obj.id] = this.objects.length;
    }

    if (obj.groups) {
      for (let group of obj.groups) {
        if (this.groups[group] !== undefined) {
          this.groups[group].push(this.objects.length);
        } else {
          this.groups[group] = [this.objects.length];
        }
      }
    }
    this.objects.push(obj);
  }

  getObjectsInGroups(groups) {
    const indices = [];
    for (let group of groups) {
      if (this.groups[group]) {
        indices.push(...this.groups[group]);        
      }
    }
    return indices.map((index) => { return this.objects[index]; })
  }

  getObjectByName(name) {
    const index = this.names[name];
    if (index !== undefined && this.objects.length > index) {
      return this.objects[index];
    }
    return null;
  }

  destroy(object) {
    const index = this.objects.indexOf(object);
    if (index !== -1) {
      this.objects[index].destroy();
      this.objects.splice(index, 1);
      
      if (object.id) {
        delete this.names[object.id];
      }

      if (object.groups) {
        for (let groupName of object.groups) {
          const group = this.groups[groupName];
          const indexOnGrp = group.indexOf(index);
          if (indexOnGrp !== -1) {
            group.splice(indexOnGrp, 1);
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }
}

export default Game;