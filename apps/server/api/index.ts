import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { db, todos } from '../src/db/index.js'
import { eq, and } from 'drizzle-orm'

const app = new Hono()

// CORS middleware for Vercel deployment
app.use('*', cors({
  origin: [
    'https://todo-app-training-web.vercel.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Clerk middleware with error handling
app.use('*', async (c, next) => {
  try {
    return await clerkMiddleware()(c, next)
  } catch (error) {
    console.error('Clerk middleware error:', error)
    return c.json({ error: 'Authentication configuration error' }, 500)
  }
})

app.get('/', (c) => {
  return c.json({ 
    message: 'Todo API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/debug', async (c) => {
  try {
    // Test database connection
    const result = await db.select().from(todos).limit(1)
    return c.json({
      status: 'ok',
      message: 'Database connection successful',
      hasData: result.length > 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500)
  }
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
export default handle(app)