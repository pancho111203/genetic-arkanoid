import * as THREE from 'three';
import * as _ from 'ramda';
import './extensions';
import Camera from './objects/camera';
import { getUrlVars } from './util';
import Level from './Level';
import { runsOnWorker } from './util';
import ResourceLoader from './ResourceLoader';

// TODO add listeners to notify on completion

class Simulation {
  constructor(rendering, levelConfigurations, timeStep = 1 / 60.0, updatesPerTimestep = 1) {
    this.timeStep = timeStep;
    this.terminated = false;
    this.updatesPerTimestep = updatesPerTimestep;
    this.levelConfigurations = levelConfigurations;
    this.rendering = rendering;
    this.scene = new THREE.Scene();
    this.scene.name = 'MainScene';
    this.renderer = null;
    this.camera = null;
    this.lastTime = undefined;
    this.delta = 0;

    this.callbacks = {
      onFinished: []
    };

    if (this.rendering && window && document) {
      window.THREE = THREE;
      window.scene = this.scene;

      this.resourceLoader = new ResourceLoader();
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


      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth - 4, window.innerHeight - 4);
      document.body.appendChild(this.renderer.domElement);

      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.camera = new Camera(this.renderer, this.scene);

      const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
      ambientLight.name = 'Ambient Light';

      this.scene.add(ambientLight);


      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.camera.updateProjectionMatrix();
      });
    }

    this.setLevels();

    if (runsOnWorker()) {
      this.mainLoopWorker().then(() => {
      });
    } else {
      requestAnimationFrame((time) => this.mainLoop(time));
    }
  }

  async mainLoopWorker() {
    while (!this.terminated) {
      await new Promise((resolve, reject) => {
        this.update();
        this.scene.updateMatrixWorld();
        resolve();
      });
    }
  }

  onFinished(cb) {
    this.callbacks.onFinished.push(cb);
  }

  trackLevelHasFinished(index) {
    return (metrics, level) => {
      if (this.levels[index] === level) {
        this.finishedLevelsMetrics[index] = metrics;
      }

      // call onfinished if all levels finished
      if (!this.finishedLevelsMetrics.some((o) => o === null)) {
        for (let cb of this.callbacks.onFinished) {
          const timeTaken = (Date.now() - this.startTime) / 1000;
          const res = {
            metrics: this.finishedLevelsMetrics,
            secondsTaken: timeTaken
          };
          cb(res);
        }
      }
    }
  }

  setLevels() {
    this.levels = [];
    this.finishedLevelsMetrics = [];
    for (let i = 0; i < this.levelConfigurations.length; i++) {
      const levelConfiguration = this.levelConfigurations[i];
      const levelNr = levelConfiguration['levelNr'];
      const balls = levelConfiguration['balls'];

      const x = i % 5;
      const y = Math.floor(i / 5);
      const index = this.levels.length;
//      const level = new Level(this, levelNr, new THREE.Vector3(-120 * x, 150 * y, 0), balls);
      const level = new Level(this, levelNr, new THREE.Vector3(-150 * x, 180 * y, 0), balls);
      level.metrics.onFinished(this.trackLevelHasFinished(index));
      this.levels.push(level);
      this.finishedLevelsMetrics.push(null);
    }
  }

  // TODO fix gameloop to make update at fixed timestep - https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
  // TODO implement way of making update much quicker for genetic simulations
  mainLoop(time) {
    if (this.terminated) {
      return;
    }
    if (this.lastTime == undefined) {
      this.lastTime = time;
    }

    requestAnimationFrame((time) => this.mainLoop(time));

    // Perform fixed timestep updates
    const dt = (time - this.lastTime) / 1000;
    this.delta += dt;
    if (this.delta >= this.timeStep) {
      this.delta -= this.timeStep;
      this.update();
    }

    if (this.rendering) {
      this.renderer.render(this.scene, this.camera.camera);
    } else {
      this.scene.updateMatrixWorld();
    }

    this.lastTime = time;
  }

  terminate() {
    this.terminated = true;
  }

  isRendering() {
    return this.rendering;
  }

  update() {
    for (let i = 0; i < this.updatesPerTimestep; i++) {
      if (this.camera) {
        this.camera.update();
      }
      for (let level of this.levels) {
        level.update();
      }
    }
  }

  run() {
    this.startTime = Date.now();
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
    this.changeLevels(this.levelConfigurations);
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




