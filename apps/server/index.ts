import { Hono } from 'hono'
import { db, todos } from './src/db'

const app = new Hono()

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

export default {
  port: 3001,
  fetch: app.fetch,
}