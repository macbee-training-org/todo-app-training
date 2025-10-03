import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { db, todos } from '../src/db/index.js'
import { eq, and } from 'drizzle-orm'

const app = new Hono()

// CORS middleware for local development and Vercel deployment
app.use('*', async (c, next) => {
  const origin = c.req.header('origin')
  
  // Allow localhost for development
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://todo-app-training-web.vercel.app'
  ]
  
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin)
  } else {
    // Default to localhost for development
    c.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  }
  
  c.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    console.log('CORS middleware: Handling OPTIONS request for:', c.req.url)
    return c.text('OK', 200)
  }
  
  await next()
})

// Clerk middleware with error handling (skip auth for OPTIONS preflight)
app.use('*', async (c, next) => {
  // Skip authentication for OPTIONS requests (CORS preflight)
  if (c.req.method === 'OPTIONS') {
    return await next()
  }
  
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

// Test endpoint without authentication
app.get('/test-todos', async (c) => {
  try {
    const testTodos = await db.select().from(todos).limit(5)
    
    // Add CORS headers
    c.header('Access-Control-Allow-Origin', 'https://todo-app-training-web.vercel.app')
    c.header('Access-Control-Allow-Credentials', 'true')
    
    return c.json({
      message: 'Test todos endpoint working',
      count: testTodos.length,
      todos: testTodos,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database error in test-todos:', error)
    return c.json({ 
      error: 'Database error', 
      message: error.message 
    }, 500)
  }
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

// Explicit OPTIONS handler for todos endpoint
app.options('/todos', (c) => {
  console.log('Handling OPTIONS request for /todos')
  
  // Set complete CORS headers for preflight
  c.header('Access-Control-Allow-Origin', 'https://todo-app-training-web.vercel.app')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
  
  return c.text('OK', 200)
})

app.get('/todos', async (c) => {
  const headers = c.req.header()
  console.log('GET /todos - Request headers:', headers)
  
  const auth = getAuth(c)
  console.log('GET /todos - Auth result:', auth)
  
  if (!auth?.userId) {
    return c.json({ 
      error: 'Unauthorized', 
      debug: {
        hasAuth: !!auth,
        userId: auth?.userId,
        headers: c.req.header()
      }
    }, 401)
  }
  
  const userTodos = await db.select()
    .from(todos)
    .where(eq(todos.userId, auth.userId))
  
  // Add CORS headers to actual response
  c.header('Access-Control-Allow-Origin', 'https://todo-app-training-web.vercel.app')
  c.header('Access-Control-Allow-Credentials', 'true')
  
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
  
  // Add CORS headers to actual response
  c.header('Access-Control-Allow-Origin', 'https://todo-app-training-web.vercel.app')
  c.header('Access-Control-Allow-Credentials', 'true')
  
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
// Vercel用
export default handle(app)

// ローカル開発用 Bun.serve
if (Bun.serve) {
  Bun.serve({
    port: 3001,
    fetch: app.fetch,
  })
  console.log('🚀 API Server running on http://localhost:3001')
}