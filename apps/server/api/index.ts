import { Hono } from 'hono'
import rpcApp from './rpc.js'

const app = new Hono()

// Mount RPC routes
app.route('/rpc', rpcApp)

// CORS middleware for local development
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

// Health check endpoint
app.get('/', async (c) => {
  return c.json({ 
    message: 'RPC server is running', 
    timestamp: new Date().toISOString(),
    endpoints: ['/rpc/getTodos', '/rpc/createTodo', '/rpc/updateTodo', '/rpc/deleteTodo']
  })
})

export default app
export type AppType = typeof app