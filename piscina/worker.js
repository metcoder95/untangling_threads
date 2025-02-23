import { threadId } from 'worker_threads';

function handler({ command, data }) {
  console.log(
    `worker ${threadId}>>> from parent - command: ${command} data: ${data}`
  );

  switch (command) {
    case 'calculate':
      const isPair = data % 2 === 0;
      return {
        threadId,
        state: 'done',
        data,
        isPair: isPair,
      };
    default:
      throw new Error('Unknown command');
  }
}

export default handler;