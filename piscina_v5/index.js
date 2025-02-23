import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import Piscina from 'piscina';

const pool = new Piscina({
  filename: join(fileURLToPath(import.meta.url), '../worker.js'),
  minThreads: 2,
  maxThreads: 2,
  atomics: 'sync',
  loadBalancer: (tasks, workers) => {
    const hint = tasks.taskId % 2 === 0 ? 0 : 1;
    const worker = workers[hint];

    return worker;
  }
});

for (let i = 1; i < 11; i++) {
  const result = await pool.run({ command: 'calculate', data: i });

  console.log(
    `from thread ${result.threadId} The number ${result.data} is ${result.isPair ? 'pair' : 'odd'}`
  );
}

setTimeout(() => {
  console.log('main>>> running');
}, 6000)