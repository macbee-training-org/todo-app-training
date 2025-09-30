import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db, todos } from './src/db'
import { eq } from 'drizzle-orm'

const app = new Hono()
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.get('/', (c) => {
  return c.json({ message: 'Todo API Server' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 全Todo取得
app.get('/todos', async (c) => {
  const allTodos = await db.select().from(todos)
  return c.json(allTodos)
})

// Todo作成
app.post('/todos', async (c) => {
  const body = await c.req.json()
  const { title } = body
  
  if (!title) {
    return c.json({ error: 'Title is required' }, 400)
  }
  
  const newTodo = await db.insert(todos).values({
    title,
    completed: false,
    createdAt: new Date()
  }).returning()
  
  return c.json(newTodo[0], 201)
})

// Todo更新
app.patch('/todos/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  
  const updatedTodo = await db.update(todos)
    .set(body)
    .where(eq(todos.id, id))
    .returning()
  
  if (updatedTodo.length === 0) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  
  return c.json(updatedTodo[0])
})

// Todo削除
app.delete('/todos/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  
  const deletedTodo = await db.delete(todos)
    .where(eq(todos.id, id))
    .returning()
  
  if (deletedTodo.length === 0) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  
  return c.json({ message: 'Todo deleted successfully' })
})

export default {
  port: 3001,
  fetch: app.fetch,
}