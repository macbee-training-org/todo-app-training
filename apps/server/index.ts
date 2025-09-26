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

export default {
  port: 3001,
  fetch: app.fetch,
}