import { Application } from '@oak/oak';

import todoRoutes from './routes/todos.ts';

const app = new Application();

app.use(async (_ctx, next) => {
  console.log('Some middleware...');
  await next();
});

app.use(todoRoutes.routes());
app.use(todoRoutes.allowedMethods());

await app.listen({ port: 8000 }).then(() => {
  console.log('Deno-Oak server listening on port 8000...');
});
