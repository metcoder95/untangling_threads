import { threadId } from 'worker_threads';

setInterval(() => {
  console.log(`worker ${threadId}>>> running`);
}, 500)

function handler({ command, data }) {
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