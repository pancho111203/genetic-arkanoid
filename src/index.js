import * as THREE from 'three';
import './extensions';
import { timeStep, updatesPerTimestep } from './globals'
import Camera from './objects/camera';
import { getUrlVars } from './util';
import Level from './Level';

const RENDERING = true;

const levelNr = getUrlVars()['level'] || 0;
const WORLD = {};
const scene = new THREE.Scene();
scene.name = 'MainScene';
window.THREE = THREE;
window.scene = scene;
window.WORLD = WORLD;
WORLD.scene = scene;

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
scene.background = cubeTexture;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 4, window.innerHeight - 4);
document.body.appendChild(renderer.domElement);
WORLD.renderer = renderer;

const camera = new Camera();
WORLD.camera = camera;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.camera.aspect = window.innerWidth / window.innerHeight;
    camera.camera.updateProjectionMatrix();
});

const level = new Level(levelNr, new THREE.Vector3(-2, 0, 0));
const levels = [level]; // TODO add more levels

// const levels = [];
// for (let i = 0; i < 20; i++) {
//     const x = i % 5;
//     const y = Math.floor(i/5);
//     const level = new Level(i, new THREE.Vector3(-120 * x, 150 * y, 0));
//     levels.push(level);
// }

window.run = () => {
    for (let lvl of levels) {
        lvl.run();
    }
}

window.pause = () => {
    for (let lvl of levels) {
        lvl.pause();
    }
}

window.reset = () => {
    for (let lvl of levels) {
        lvl.reset();
    }
}

let lastTime;
let delta = 0;
// TODO fix gameloop to make update at fixed timestep - https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
// TODO implement way of making update much quicker for genetic simulations
function mainLoop(time) {
    if (lastTime == undefined) {
        lastTime = time;
    }

    requestAnimationFrame(mainLoop);

    // Perform fixed timestep updates
    const dt = (time - lastTime) / 1000;
    delta += dt;
    if (delta >= timeStep) {
        delta -= timeStep;
        for (let i = 0; i < updatesPerTimestep; i++) {
            camera.update();
            for (let level of levels) {
                level.update();
            }
        }
    }

    if (RENDERING) {
        renderer.render(scene, camera.camera);
    } else {
        scene.updateMatrixWorld();
        camera.camera.updateMatrixWorld();
        camera.camera.matrixWorldInverse.getInverse(camera.camera.matrixWorld);    
    }

    lastTime = time;
}

requestAnimationFrame(mainLoop);