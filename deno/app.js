import http from 'node:http';

const server = http.createServer((req, res) => {
  res.end('Hello, World! (from node)');
});

server.listen(3000);
