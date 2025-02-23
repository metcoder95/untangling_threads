import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const worker = new Worker(
  join(fileURLToPath(import.meta.url), '..', 'worker.js')
);

const MAX_NUMBER = 10;
let counter = 0;
worker.on('message', (message) => {
  const { data, isPair } = message;

  switch (data) {
    case 'ready': {
      console.log('main>>> worker is ready');
      for (let i = 1; i < MAX_NUMBER + 1; i++) {
        worker.postMessage({ command: 'ispair', data: i });
      }

      worker.postMessage({ command: 'exit' });
      break;
    }
    case 'exit': {
      console.log('main>>> worker closing');
      break;
    }
    default: {
      counter++;

      if (isPair) {
        console.log(`main>>> The number ${data} is pair`);
      }
    }
  }
});

worker.on('error', (error) => {
  console.error('main>>> worker error', error);
});

worker.on('exit', (code) => {
  console.log('main>>> worker exit with code', code);
  process.exit(code);
});
