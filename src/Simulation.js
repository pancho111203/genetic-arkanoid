import * as THREE from 'three';
import './extensions';
import { timeStep, updatesPerTimestep } from './globals'
import Camera from './objects/camera';
import { getUrlVars } from './util';
import Level from './Level';

// TODO add listeners to notify on completion

class Simulation {
  constructor(rendering, levelConfigurations) {
    this.levelConfigurations = levelConfigurations;
    this.rendering = rendering;
    this.scene = new THREE.Scene();
    this.scene.name = 'MainScene';

    this.lastTime = undefined;
    this.delta = 0;

    const cubeTexture = new THREE.CubeTextureLoader()
      .setPath('dist/textures/cube/skybox/')
      .load([
        'px.jpg',
        'nx.jpg',
        'py.jpg',
        'ny.jpg',
        'pz.jpg',
        'nz.jpg'
      ]);
    this.scene.background = cubeTexture;

    this.renderer = null;
    this.camera = null;
    if (this.rendering && window && document) {
      window.THREE = THREE;
      window.scene = this.scene;

      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth - 4, window.innerHeight - 4);
      document.body.appendChild(this.renderer.domElement);

      this.camera = new Camera();

      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.camera.updateProjectionMatrix();
      });
    }

    this.setLevels();
    
    requestAnimationFrame((time) => this.mainLoop(time));
  }

  setLevels() {
    this.levels = [];
    for (let i = 0; i < this.levelConfigurations.length; i++) {
      const levelConfiguration = this.levelConfigurations[i];
      const levelNr = levelConfiguration['levelNr'];
      const balls = levelConfiguration['balls'];

      const x = i % 5;
      const y = Math.floor(i / 5);
      const level = new Level(this, levelNr, new THREE.Vector3(-120 * x, 150 * y, 0), balls);
      this.levels.push(level);
    }
  }

  // TODO fix gameloop to make update at fixed timestep - https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
  // TODO implement way of making update much quicker for genetic simulations
  mainLoop(time) {
    if (this.lastTime == undefined) {
      this.lastTime = time;
    }

    requestAnimationFrame((time) => this.mainLoop(time));

    // Perform fixed timestep updates
    const dt = (time - this.lastTime) / 1000;
    this.delta += dt;
    if (this.delta >= timeStep) {
      this.delta -= timeStep;
      for (let i = 0; i < updatesPerTimestep; i++) {
        if (this.camera) {
          this.camera.update();
        }
        for (let level of this.levels) {
          level.update();
        }
      }
    }

    if (this.rendering) {
      this.renderer.render(this.scene, this.camera.camera);
    } else {
      this.scene.updateMatrixWorld();
    }

    this.lastTime = time;
  }

  isRendering() {
    return this.rendering;
  }

  run() {
    for (let lvl of this.levels) {
      lvl.run();
    }
  }

  pause() {
    for (let lvl of this.levels) {
      lvl.pause();
    }
  }

  reset() {
    for (let lvl of this.levels) {
      lvl.reset();
    }
  }

  changeLevels(levelConfigurations) {
    this.levelConfigurations = levelConfigurations;

    for (let lvl of this.levels) {
      lvl.destroy();
    }

    this.setLevels();
  }
}

export default Simulation;



