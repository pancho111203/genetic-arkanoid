import WorkerAlg from './algorithm.worker';
this.worker = new WorkerAlg;
this.worker.onmessage = (e) => {
  const receivedObject = e.data;
}


sendValuesToAlgorithm = (data) => {
  const msg = {
    data,
    algorithm: this.props.algorithm,
    config: this.props.config || null
  }
  this.worker.postMessage(msg);
}