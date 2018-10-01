import WorkerAlg from './optimizers/genetic.worker';

class GeneticBridge {
  constructor() {
    this.onGenerationReceivedCallbacks = [];
    this.onFinishedCallbacks = [];
    this.temp = 0;
    this.worker = new WorkerAlg;
    this.worker.onmessage = (e) => {
      const receivedObject = e.data;
      const type = receivedObject.type;
      const data = receivedObject.data;
      switch (type) {
        case 'finished':
          for (let cb of this.onFinishedCallbacks) {
            cb(data);
          }
          break;
        case 'generation':
          for (let cb of this.onGenerationReceivedCallbacks) {
            cb(data);
          }
          break;
      }

    }
  }

  onGenerationReceived(cb) {
    this.onGenerationReceivedCallbacks.push(cb);
  }

  onFinished(cb) {
    this.onFinishedCallbacks.push(cb);
  }

  startOptimizer(level = 0, config) {
    const msg = {
      level: level,
      config: config
    };

    this.worker.postMessage(msg);
  }
}

export default GeneticBridge;