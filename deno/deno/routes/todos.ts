import { Router } from '@oak/oak';

const router = new Router();

interface Todo {
  id: string;
  text: string;
}

const todos: Todo[] = [];

router.get('/', (ctx) => {
  ctx.response.body = { todos };
});

router.post('/todos', async (ctx) => {
  const { text } = await ctx.request.body.json();

  const newTodo: Todo = { id: new Date().toISOString(), text };
  todos.push(newTodo);

  ctx.response.body = { message: `Todo created successfully.`, data: newTodo };
});

router.put('/todos/:id', async (ctx) => {
  const { id } = ctx.params;
  const { text } = await ctx.request.body.json();

  if (!id) {
    ctx.response.status = 400;
    ctx.response.body = { error: 'todo id is required!' };
  }

  const todoIndex = todos.findIndex((item) => item.id === id);

  if (todoIndex < 0) {
    ctx.response.status = 404;
    ctx.response.body = { error: `Todo with id: ${id} not found!` };
  }

  todos[todoIndex].text = text;

  ctx.response.body = { message: `Todo with id: ${id} updated successfully!` };
});

router.delete('/todos/:id', (ctx) => {
  const { id } = ctx.params;

  if (!id) {
    ctx.response.status = 400;
    ctx.response.body = { error: 'todo id is required!' };
  }

  const todoIndex = todos.findIndex((item) => item.id === id);

  if (todoIndex < 0) {
    ctx.response.status = 404;
    ctx.response.body = { error: `Todo with id: ${id} not found!` };
  }

  todos.splice(todoIndex, 1);

  ctx.response.body = { message: `Todo with id: ${id} deleted successfully!` };
});

export default router;
