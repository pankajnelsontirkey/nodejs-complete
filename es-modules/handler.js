import fs from 'fs/promises';
// import { dirname, join } from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

export const handler = async (req, res, next) => {
  try {
    const data = await fs.readFile('my-page.html', 'utf8');
    res.send(data);
  } catch (error) {}
  console.log(error);

  // res.sendFile(join(__dirname, 'my-page.html'));
};
