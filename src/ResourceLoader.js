import * as THREE from 'three';
import * as OBJLoader from 'three-obj-loader';
import TGALoader from '../lib/TGALoader';
OBJLoader(THREE);

const LOADERS = {
  'texture': THREE.TextureLoader,
  'obj': THREE.OBJLoader,
  'tga': TGALoader,
  'json': THREE.JSONLoader,
  'object': THREE.ObjectLoader
};

const cache = {};

class ResourceLoader {
  // Call like this: load([['text.png', 'texture'], ['md.obj', 'obj']]).then((resources) => { ... })
  load(files) {
    const promises = [];
    for (let file of files) {
      const filename = file[0];

      if (cache[filename] !== undefined) {
        console.log(`Getting resource ${filename} from cache`);
        const promise = new Promise((resolve, reject) => {
          if (cache[filename]) {
            resolve(cache[filename]);
          } else {
            reject('resource not found on cache');
          }
        });
        promises.push(promise);
      } else {
        const loaderObj = LOADERS[file[1]];
        const loader = new loaderObj();

        const promise = new Promise((resolve, reject) => {
          loader.load(
            filename,
            (res) => {
              console.log(`Loaded resource ${filename}`);
              cache[filename] = res;
              resolve(res);
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '%');
            },
            (error) => {
              console.error(`Error downloading resource ${filename}`);
              console.error(error);
              reject(error);
            }
          );
        });

        promises.push(promise);
      }
    }

    return Promise.all(promises);
  }
};

export default ResourceLoader;