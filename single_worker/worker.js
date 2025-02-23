import { parentPort } from 'node:worker_threads';

parentPort.on('message', (message) => {
  console.log(
    'worker>>> from parent - command:',
    message.command,
    'data:',
    message.data
  );
  const { command, data } = message;

  switch (command) {
    case 'ispair':
      if (data % 2 === 0) {
        parentPort.postMessage({ data, isPair: true });
      }
      break;
    case 'exit':
      parentPort.postMessage({ data: 'exit' });
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

parentPort.postMessage({ data: 'ready' });
