import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import Piscina from 'piscina';

const pool = new Piscina({
  filename: join(fileURLToPath(import.meta.url), '../worker.js'),
});

for (let i = 1; i < 11; i++) {
  const result = await pool.run({ command: 'calculate', data: i });

  console.log(
    `main>>> The number ${result.data} is ${result.isPair ? 'pair' : 'odd'}`
  );
}
