import express from 'express';
import bodyParser from 'body-parser';

import todosRouter from './routes/todos.js';

const app = express();

app.use(bodyParser.json());

app.use(todosRouter);

app.listen(3000, () => {
  console.log('Node-Express server listening on port 3000...');
});
