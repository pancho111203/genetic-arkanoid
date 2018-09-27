class GameObject {
  constructor(game, name) {
    this.game = game;
    this.name = name;
    this.loaded = false;
  }

  update() {
  }

  isId(id) {
    return this.id === id;
  }

  isOfGroup(group) {
    if (this.groups) {
      return ~this.groups.indexOf(group);
    }
    return false;
  }

  loadMeshToScene(mesh) {
    this.mesh = mesh;
    this.mesh.name = this.name;
    this.game.scene.add(mesh);
  }

  destroy() {
    if (this.mesh) {
      this.game.scene.remove(this.mesh);
    }
  }
}

export default GameObject;