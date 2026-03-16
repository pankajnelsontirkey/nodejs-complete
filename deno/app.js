import { writeFile } from 'node:fs/promises';

const text = 'This is a test - and it should be stored in a file!';

writeFile('node-message.txt', text).then(() => {
  console.log('Saved to file');
});
