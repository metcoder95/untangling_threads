import { threadId, Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const MAX_NUMBER = 10;
const MAX_WORKERS = Math.round(availableParallelism() / 2);
const IDLE_TIMEOUT = 10000;
const workers = new Map();
const tasks = new Map();

for (let i = 0; i < MAX_WORKERS; i++) {
  const worker = new Worker(
    join(fileURLToPath(import.meta.url), '..', 'worker.js'),
    {
      workerData: { timeout: IDLE_TIMEOUT },
    }
  );
  const workerinfo = {
    worker,
    threadId: worker.threadId,
    ready: false,
  };

  worker.on('message', (message) => {
    const { state, threadId, data, isPair } = message;

    switch (state) {
      case 'ready': {
        console.log('main>>> worker is ready - ', worker.threadId);
        workerinfo.ready = true;
      }
      case 'exit': {
        console.log('main>>> worker closing');
        worker.ready = false;
        break;
      }
      case 'done': {
        const task = tasks.get(`${threadId}-${data}`);
        tasks.delete(`${threadId}-${data}`);

        if (task) {
          console.log(
            `main>>> The number ${data} is ${isPair ? 'pair' : 'odd'}`
          );
        }
        break;
      }
      default: {
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

  workers.set(worker.threadId, workerinfo);
}

let readyWorkers = 0;
while (true) {
  for (const worker of workers.values()) {
    if (worker.ready) {
      readyWorkers++;
    }
  }

  if (readyWorkers === MAX_WORKERS) {
    break;
  }

  await sleep(1000);
}

console.log('main>>> all workers are ready');
for (let i = 1; i < MAX_NUMBER; i++) {
  const workerInfo = workers.get(Math.max(i % MAX_WORKERS, 1));

  const task = {
    command: 'calculate',
    data: i,
    threadId: workerInfo.threadId,
  };

  workerInfo.worker.postMessage(task);
  tasks.set(`${task.threadId}-${task.data}`, task);
  console.log(`main>>> sent task to worker ${workerInfo.threadId} - ${i}`);
}

console.log('main>>> all tasks are sent');
while (tasks.size > 0) {
  console.log('main>>> waiting for tasks to finish');
  await sleep(1000);
}

console.log('main>>> all tasks are done');
for (const worker of workers.values()) {
  console.log('main>>> sending exit to worker', worker.threadId);
  worker.worker.postMessage({ command: 'exit' });
}
