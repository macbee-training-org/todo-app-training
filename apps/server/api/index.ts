import { Hono } from 'hono'
// Vercel handle removed - focusing on local development
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { db, todos } from '../src/db/index.js'
import { eq, and } from 'drizzle-orm'
import { TodoResponseSchema, CreateTodoSchema, UpdateTodoSchema } from '../src/schemas.js'
import { z } from 'zod'
import { rpcApp } from './rpc.js'

const app = new Hono()

// CORS middleware for local development
app.use('*', async (c, next) => {
  const origin = c.req.header('origin')
  
  // Allow localhost for development
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000'
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
    // CORS preflight request handled
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
    c.header('Access-Control-Allow-Origin', 'http://localhost:3000')
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
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Debug endpoint removed - codebase cleaned for training program

// OPTIONS handler for todos endpoint
app.options('/todos', (c) => {
  
  // Set complete CORS headers for preflight
  c.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
  
  return c.text('OK', 200)
})

app.get('/todos', async (c) => {
  const auth = getAuth(c)
  
  if (!auth?.userId) {
    return c.json({ 
      error: 'Unauthorized'
    }, 401)
  }
  
  const userTodos = await db.select()
    .from(todos)
    .where(eq(todos.userId, auth.userId))
  
  // Add CORS headers to actual response
  c.header('Access-Control-Allow-Origin', 'http://localhost:3000')
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
  c.header('Access-Control-Allow-Origin', 'http://localhost:3000')
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
// MCP専用エンドポイント（認証なし、ローカル開発用）
app.get('/mcp/todos', async (c) => {
  // Development use only - no auth required for MCP
  const allTodos = await db.select().from(todos)
  
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  
  return c.json(allTodos)
})

app.post('/mcp/todos', async (c) => {
  const body = await c.req.json()
  const { title } = body
  
  // Use hardcoded user for MCP
  const newTodo = await db.insert(todos).values({
    userId: 'mcp-user', // Fixed user for MCP server
    title,
    description: '',
    completed: false,
    createdAt: new Date()
  }).returning()
  
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*')
  
  return c.json(newTodo[0], 201)
})

app.patch('/mcp/todos/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  
  const updatedTodo = await db.update(todos)
    .set(body)
    .where(eq(todos.id, id))
    .returning()
  
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*')
  
  return c.json(updatedTodo[0])
})

app.delete('/mcp/todos/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  
  await db.delete(todos)
    .where(eq(todos.id, id))
  
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*')
  
  return c.json({ message: 'Todo deleted successfully' })
})

// Mount RPC routes
app.route('/rpc', rpcApp)

// export default handle(app) // Removed Vercel export for local development focus

// ローカル開発用 Bun.serve
if (Bun.serve) {
  Bun.serve({
    port: 3001,
    fetch: app.fetch,
  })
  console.log('🚀 API Server running on http://localhost:3001')
}