import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const handler = (req, res, next) => {
  res.sendFile(join(__dirname, 'my-page.html'));
};
