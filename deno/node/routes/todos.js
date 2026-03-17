import Router from 'express';

const router = Router();

const todos = [];

router.get('/', (req, res, next) => {
  res.status(200).json({ todos });
});

router.post('/todos', (req, res, next) => {
  const { text } = req.body;

  const newTodo = { id: new Date().toISOString(), text };
  todos.push(newTodo);

  return res
    .status(201)
    .json({ message: 'Created new todo item', data: todos[todos.length - 1] });
});

router.put('/todos/:id', (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'todo id is required!' });
  }

  const todoIndex = todos.findIndex((item) => item.id === id);

  if (todoIndex < 0) {
    return res.status(404).json({ error: `Todo with id: ${id} not found!` });
  }

  todos[todoIndex].text = text;

  return res
    .status(200)
    .json({ message: `Todo with id: ${id} updated successfully!` });
});

router.delete('/todos/:id', (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'todo id is required!' });
  }

  const todoIndex = todos.findIndex((item) => item.id === id);

  if (todoIndex < 0) {
    return res.status(404).json({ error: `Todo with id: ${id} not found!` });
  }

  todos.splice(todoIndex, 1);

  return res
    .status(200)
    .json({ message: `Todo with id: ${id} deleted successfully!` });
});

export default router;
