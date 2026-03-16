import { Router } from 'express';

import type { Todo } from '../models/todo.js';

let todos: Todo[] = [];

const router = Router();

router.get('/', (req, res, next) => {
  res.status(200).json({ todos });
});

router.post('/todos', (req, res, next) => {
  const { text } = req.body;

  const newTodo: Todo = { id: new Date().toISOString(), text };
  todos.push(newTodo);

  res.status(201).json({ message: 'added todo' });
});

router.put('/todos/:todoId', (req, res, next) => {
  const { todoId } = req.params;
  const { text } = req.body;

  if (!todoId) {
    return res.status(400).json({ error: 'todoId missing!' });
  }

  let updatedTodo = todos.find((item) => item.id === todoId);

  if (!updatedTodo) {
    return res.status(404).json({ error: `Todo with id ${todoId} not found!` });
  }

  updatedTodo = { ...updatedTodo, text };

  res.status(200).json({ message: `Updated todo with id ${todoId}` });
});

router.delete('/todos/:todoId', (req, res, next) => {
  const { todoId } = req.params;

  if (!todoId) {
    return res.status(400).json({ error: 'todoId missing!' });
  }

  let removeTodoIndex = todos.findIndex((item) => item.id === todoId);

  if (!removeTodoIndex) {
    return res.status(404).json({ error: `Todo with id ${todoId} not found!` });
  }

  todos = todos.filter((item) => item.id !== removeTodoIndex.toString());

  return res.status(200).json({ message: `Deleted todo with id ${todoId}` });
});

export default router;
