import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { db, todos } from './src/db/index.js'
import { eq, and } from 'drizzle-orm'

const app = new Hono()

app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', clerkMiddleware())

app.get('/', (c) => {
  return c.json({ message: 'Todo API Server' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/todos', async (c) => {
  const auth = getAuth(c)
  
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const userTodos = await db.select()
    .from(todos)
    .where(eq(todos.userId, auth.userId))
  
  return c.json(userTodos)
})

app.post('/todos', async (c) => {
  const auth = getAuth(c)
  
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const body = await c.req.json()
  const { title, description } = body
  
  if (!title) {
    return c.json({ error: 'Title is required' }, 400)
  }
  
  const newTodo = await db.insert(todos).values({
    userId: auth.userId,
    title,
    description,
    completed: false,
    createdAt: new Date()
  }).returning()
  
  return c.json(newTodo[0], 201)
})

app.patch('/todos/:id', async (c) => {
  const auth = getAuth(c)
  
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  
  const updatedTodo = await db.update(todos)
    .set(body)
    .where(and(eq(todos.id, id), eq(todos.userId, auth.userId)))
    .returning()
  
  if (updatedTodo.length === 0) {
    return c.json({ error: 'Todo not found or unauthorized' }, 404)
  }
  
  return c.json(updatedTodo[0])
})

app.delete('/todos/:id', async (c) => {
  const auth = getAuth(c)
  
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const id = parseInt(c.req.param('id'))
  
  const deletedTodo = await db.delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, auth.userId)))
    .returning()
  
  if (deletedTodo.length === 0) {
    return c.json({ error: 'Todo not found or unauthorized' }, 404)
  }
  
  return c.json({ message: 'Todo deleted successfully' })
})
const port = process.env.PORT || 3001

console.log(`Server is running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
}