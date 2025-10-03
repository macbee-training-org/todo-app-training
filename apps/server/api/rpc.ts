import { Hono } from 'hono'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { db, todos } from '../src/db/index.js'
import { eq, and } from 'drizzle-orm'
import { TodoResponseSchema, CreateTodoSchema, UpdateTodoSchema } from '../src/schemas.js'
import { z } from 'zod'

// Create RPC app
const rpcApp = new Hono()

// Apply authentication middleware
rpcApp.use('*', async (c, next) => {
  try {
    return await clerkMiddleware()(c, next)
  } catch (error) {
    console.error('Clerk middleware error:', error instanceof Error ? error.message : 'Unknown error')
    return c.json({ 
      error: 'Authentication error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Type-safe routes

// 1. Get all todos
rpcApp.get('/', async (c) => {
    const auth = getAuth(c)
    
    if (!auth?.userId) {
      return c.json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      }, 401)
    }

    try {
      const userTodos = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, auth.userId))

      // Transform to response format
      const response = userTodos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString()
      }))

      // Validate response with Zod
      const validatedResponse = z.array(TodoResponseSchema).parse(response)
      
      return c.json({ 
        success: true,
        data: validatedResponse,
        message: `Found ${validatedResponse.length} todos`
      })
    } catch (error) {
      console.error('Database error in getTodos:', error)
      return c.json({ 
        error: 'Database error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
})

// 2. Create todo
rpcApp.post('/', async (c) => {
    const auth = getAuth(c)
    
    if (!auth?.userId) {
      return c.json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      }, 401)
    }

    try {
      const body = await c.req.json()
      
      // Validate input with Zod
      const validatedInput = CreateTodoSchema.parse(body)
      
      const [newTodo] = await db
        .insert(todos)
        .values({
          title: validatedInput.title,
          description: validatedInput.description || null,
          completed: false,
          userId: auth.userId,
          createdAt: new Date()
        })
        .returning()

      // Transform to response format
      const response = {
        id: newTodo.id,
        title: newTodo.title,
        description: newTodo.description,
        completed: newTodo.completed,
        createdAt: newTodo.createdAt.toISOString()
      }

      // Validate response with Zod
      const validatedResponse = TodoResponseSchema.parse(response)
      
      return c.json({ 
        success: true,
        data: validatedResponse,
        message: 'Todo created successfully'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ 
          error: 'Validation error',
          message: error.message,
          details: error.errors 
        }, 400)
      }
      
      console.error('Database error in createTodo:', error)
      return c.json({ 
        error: 'Database error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
})

// 3. Update todo
rpcApp.patch('/:id', async (c) => {
    const auth = getAuth(c)
    
    if (!auth?.userId) {
      return c.json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      }, 401)
    }

    try {
      const todoId = parseInt(c.req.param('id'))
      
      if (isNaN(todoId)) {
        return c.json({ 
          error: 'Invalid todo ID',
          message: 'Todo ID must be a number' 
        }, 400)
      }

      const body = await c.req.json()
      
      // Validate input with Zod
      const validatedInput = UpdateTodoSchema.parse(body)
      
      // First check if todo exists and belongs to user
      const [existingTodo] = await db
        .select()
        .from(todos)
        .where(and(eq(todos.id, todoId), eq(todos.userId, auth.userId)))

      if (!existingTodo) {
        return c.json({ 
          error: 'Todo not found',
          message: 'Todo not found or you do not have permission to update it' 
        }, 404)
      }

      // Update todo
      const [updatedTodo] = await db
        .update(todos)
        .set({
          ...validatedInput,
          ...(validatedInput.title !== undefined && { title: validatedInput.title }),
          ...(validatedInput.description !== undefined && { description: validatedInput.description || null }),
          ...(validatedInput.completed !== undefined && { completed: validatedInput.completed })
        })
        .where(and(eq(todos.id, todoId), eq(todos.userId, auth.userId)))
        .returning()

      // Transform to response format
      const response = {
        id: updatedTodo.id,
        title: updatedTodo.title,
        description: updatedTodo.description,
        completed: updatedTodo.completed,
        createdAt: updatedTodo.createdAt.toISOString()
      }

      // Validate response with Zod
      const validatedResponse = TodoResponseSchema.parse(response)
      
      return c.json({ 
        success: true,
        data: validatedResponse,
        message: 'Todo updated successfully'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ 
          error: 'Validation error',
          message: error.message,
          details: error.errors 
        }, 400)
      }
      
      console.error('Database error in updateTodo:', error)
      return c.json({ 
        error: 'Database error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
})

// 4. Delete todo
rpcApp.delete('/:id', async (c) => {
    const auth = getAuth(c)
    
    if (!auth?.userId) {
      return c.json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      }, 401)
    }

    try {
      const todoId = parseInt(c.req.param('id'))
      
      if (isNaN(todoId)) {
        return c.json({ 
          error: 'Invalid todo ID',
          message: 'Todo ID must be a number' 
        }, 400)
      }

      // Check if todo exists and belongs to user
      const [existingTodo] = await db
        .select()
        .from(todos)
        .where(and(eq(todos.id, todoId), eq(todos.userId, auth.userId)))

      if (!existingTodo) {
        return c.json({ 
          error: 'Todo not found',
          message: 'Todo not found or you do not have permission to delete it' 
        }, 404)
      }

      // Delete todo
      await db
        .delete(todos)
        .where(and(eq(todos.id, todoId), eq(todos.userId, auth.userId)))
      
      return c.json({ 
        success: true,
        message: 'Todo deleted successfully'
      })
    } catch (error) {
      console.error('Database error in deleteTodo:', error)
      return c.json({ 
        error: 'Database error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
})

export { rpcApp }
