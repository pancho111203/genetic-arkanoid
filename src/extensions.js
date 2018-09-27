import * as THREE from 'three';

THREE.Object3D.prototype.isOfGroup = function (group) {
  if (!this.userData.groups) {
    return false;
  }
  if (~this.userData.groups.indexOf(group)) {
    return true;
  }
  return false;
}

THREE.Object3D.prototype.isOfAnyGroup = function (groups) {
  if (!this.userData.groups) {
    return false;
  }
  for (let group of groups) {
    if (this.isOfGroup(group)) {
      return true;
    }
  }

  return false;
}

THREE.Object3D.prototype.getObjectsOfGroups = function (groups) {
  let objects = [];

  for (let i = 0, l = this.children.length; i < l; i++) {
    const child = this.children[i];
    const objectsOfChild = child.getObjectsOfGroups(groups);

    objects = [...objects, ...objectsOfChild];
  }

  if (this.isOfAnyGroup(groups)) {
    objects.push(this);
  }
  return objects;
}


