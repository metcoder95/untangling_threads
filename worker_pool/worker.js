import { parentPort, threadId, workerData } from 'node:worker_threads';

console.log(`worker ${threadId}>>> started`);
const timeoutTime = workerData.timeout;
/** @type {NodeJS.Timeout} */
let timeout = null;
parentPort.on('message', (message) => {
  const { command, data } = message;
  console.log(
    `worker ${threadId}>>> from parent - command: ${message.command} data: ${message.data}`
  );
  if (timeout) {
    clearTimeout(timeout);
  }

  switch (command) {
    case 'calculate':
      const isPair = data % 2 === 0;
      parentPort.postMessage({
        threadId,
        state: 'done',
        data,
        isPair: isPair,
      });

      timeout = setTimeout(() => {
        parentPort.postMessage({ state: 'exit', threadId });
        console.log(`worker ${threadId}>>> exiting after timeout`);
        if (process.stdout.writableLength > 0) {
          process.stdout.write('', () => {
            process.exit(0);
          }); // flush
        }
        process.exit(0);
      }, timeoutTime);
      break;
    case 'exit':
      parentPort.postMessage({ state: 'exit', threadId });
      if (process.stdout.writableLength > 0) {
        process.stdout.write('', () => {
          process.exit(0);
        }); // flush
      }
      break;
    default:
      throw new Error('Unknown command');
  }
});

parentPort.postMessage({ state: 'ready' });

timeout = setTimeout(() => {
  parentPort.postMessage({ state: 'exit', threadId });
  console.log(`worker ${threadId}>>> exiting after timeout`);
  if (process.stdout.writableLength > 0) {
    process.stdout.write('', () => {
      process.exit(0);
    }); // flush
  }
  process.exit(0);
}, timeoutTime);
