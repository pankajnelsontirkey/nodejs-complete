import fs from 'fs';

export const handler = (req, res, next) => {
  fs.readFile('my-page.html', 'utf8', (err, data) => {
    res.send(data);
  });
};

// export default handler;
