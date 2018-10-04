import './worker_fixes.js';
import SimulatedAnnealing from './SimulatedAnnealing';
import { workerLog } from './helpers';

let annealing = null;
self.onmessage = function (msg) {
  const level = msg.data.level;
  const config = msg.data.config;
  const initialIndividual = msg.data.initialIndividual;
  if (annealing) {
    annealing.terminate();
    annealing = null;
  }

  annealing = new SimulatedAnnealing(level, config);
  annealing.addGenerationCallback((individual, stats, isFinished) => {
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
        generation: [individual],
        stats,
        level: level
      }
    });
  });

  annealing.start(initialIndividual).then((res) => {
    workerLog('Last individual:');
    workerLog(res);
  });
}
