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

class ResourceLoader {
  // Call like this: load([['text.png', 'texture'], ['md.obj', 'obj']]).then((resources) => { ... })
  load(files) {
    const promises = [];
    for (let file of files) {
      const filename = file[0];
      const loaderObj = LOADERS[file[1]];
      const loader = new loaderObj();

      const promise = new Promise((resolve, reject) => {
        loader.load(
          filename,
          (res) => {
            console.log(`Loaded resource ${filename}`);
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

    return Promise.all(promises);
  }
};

export default ResourceLoader;