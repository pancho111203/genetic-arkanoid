import * as THREE from 'three';
import { STATES } from './globals';

class Game {
  constructor(level) {
    this.level = level;;
    this.objects = [];
    this.names = {};
    this.mouse = new THREE.Vector2();
    if (this.level.parentSimulation.isRendering() && window) {
      this.mouseMoveEvent = window.addEventListener('mousemove', (event) => {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
      });
    }

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

    this.objects.push(obj);
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

      return true;
    } else {
      return false;
    }
  }

  destroyAll() {
    for (let obj of this.objects) {
      obj.destroy();
    }
  }
}

export default Game;