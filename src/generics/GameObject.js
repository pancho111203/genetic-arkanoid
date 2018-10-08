class GameObject {
  constructor(level, name) {
    this.level = level;
    this.name = name;
    this.loaded = false;
  }

  update() {
  }

  isId(id) {
    return this.id === id;
  }

  loadMeshToScene(mesh) {
    this.mesh = mesh;
    this.mesh.userData.gameObject = this;
    this.mesh.name = this.name;
    this.level.scene.add(mesh);
  }

  destroy() {
    if (this.mesh) {
      this.level.scene.remove(this.mesh);
    }
  }
}

export default GameObject;