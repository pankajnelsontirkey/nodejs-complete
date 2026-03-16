import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';

import todosRoutes from './routes/todos.js';

const app = express();

app.use(bodyParser.json());

app.use(morgan('tiny'));

app.use(todosRoutes);

app.listen(3000, () => {
  console.log('server listening on port ' + 3000);
});
