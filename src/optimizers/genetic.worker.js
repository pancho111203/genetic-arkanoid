import './worker_fixes.js';
import GeneticAlg from './GeneticAlg';

let genetic = null;
self.onmessage = function (msg) {
  const level = msg.data.level;
  const config = msg.data.config;
  if (genetic) {
    genetic.terminate();
    genetic = null;
  }

  genetic = new GeneticAlg(level, config);
  genetic.addGenerationCallback((generation, stats, isFinished) => {
    if (isFinished) {
      postMessage({
        type: 'finished',
        data: null
      });
      return;
    }
    postMessage({
      type: 'generation',
      data: {
        generation,
        stats
      }
    });
  });
  genetic.evolve();
}
