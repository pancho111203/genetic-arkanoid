import * as THREE from 'three';
import * as CANNON from 'cannon';
import Ball from './objects/ball';
import Background from './objects/background';
import Game from './Game';
import Walls from './objects/walls';
import Brick from './objects/brick';
import LevelLoader from './objects/levelLoader';

import BallCreator from './objects/ballCreator';
import { timeStep, gravity, updatesPerTimestep } from './globals'
import Camera from './objects/camera';
import { STATES } from './globals';
import { getUrlVars } from './util';

const world = new CANNON.World();
world.gravity.set(gravity.x, gravity.y, gravity.z);
world.broadphase = new CANNON.NaiveBroadphase();

const scene = new THREE.Scene();
scene.name = 'MainScene';

// For threejs chrome dev tools
window.THREE = THREE;
window.scene = scene;
const game = new Game(scene, world);
window.game = game;
window.run = () => {
    if (game.state === STATES.RUNNING) {
        game.changeState(STATES.PLACING);
    } else {
        game.changeState(STATES.RUNNING);
    }
}
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 4, window.innerHeight - 4);
document.body.appendChild(renderer.domElement);

const camera = new Camera(game, 'MainCamera');
camera.id = 'camera';
game.add(camera);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.camera.aspect = window.innerWidth / window.innerHeight;
    camera.camera.updateProjectionMatrix();
});

const background = new Background(game, 'Background');
game.add(background);

const walls = new Walls(game, 'Walls');
walls.groups = ['ballCollisions'];
game.add(walls);

// const brick = new Brick(game, 'Brick');
// brick.groups = ['ballCollisions', 'destroyable'];
// game.add(brick);

const level = getUrlVars()['level'] || 0;
const levelLoader = new LevelLoader(game, 'LevelLoader', level);
game.add(levelLoader);

// const ballCreator = new BallCreator(game, 'BallCreator');
// ballCreator.id = 'ballCreator';
// game.add(ballCreator);

const ball = new Ball(game);
game.add(ball);

const maxSubSteps = 10;
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
            //        game.world.step(timeStep, dt, maxSubSteps);

            for (let obj of game.objects) {
                if (obj.update && obj.loaded == true) {
                    obj.update();
                }
            }
        }
    }

    renderer.render(scene, camera.camera);
    lastTime = time;
}

requestAnimationFrame(mainLoop);