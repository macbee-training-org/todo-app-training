import { HonoClient } from '@hono/client'
import type { TodoResponse, CreateTodoInput, UpdateTodoInput } from '../../server/src/schemas'

// Type-safe RPC client
const client = new HonoClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
})

// Import the route type from the server (for strict typing)
type RpcRoutes = typeof import('../../server/api/rpc')

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
  try {
    // This should be implemented with Clerk's getToken
    const { getAuth } = await import('@clerk/nextjs')
    return await getAuth()
  } catch {
    return null
  }
}

// RPC functions with proper typing
export const todosRPC = {
  // Get all todos
  async getTodos(): Promise<TodoResponse[]> {
    try {
      const response = await client['/rpc'].getTodos.$get()
      
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch todos')
      }
      
      return data.data
    } catch (error) {
      console.error('Error fetching todos:', error)
      throw error
    }
  },

  // Create new todo
  async createTodo(input: CreateTodoInput): Promise<TodoResponse> {
    try {
      const response = await client['/rpc'].createTodo.$post({
        json: input
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create todo: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create todo')
      }
      
      return data.data
    } catch (error) {
      console.error('Error creating todo:', error)
      throw error
    }
  },

  // Update todo
  async updateTodo(id: number, input: UpdateTodoInput): Promise<TodoResponse> {
    try {
      const response = await client[`/rpc/${id}`].updateTodo.$patch({
        json: input
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update todo: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update todo')
      }
      
      return data.data
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  },

  // Delete todo
  async deleteTodo(id: number): Promise<void> {
    try {
      const response = await client[`/rpc/${id}`].deleteTodo.$delete()
      
      if (!response.ok) {
        throw new Error(`Failed to delete todo: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete todo')
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      throw error
    }
  }
}

// Legacy API wrapper functions (to maintain compatibility)
export async function getTodos(token: string | null): Promise<TodoResponse[]> {
  return todosRPC.getTodos()
}

export async function createTodo(title: string, description: string | undefined, token: string | null): Promise<TodoResponse> {
  return todosRPC.createTodo({ title, ...(description && { description }) })
}

export async function updateTodo(id: number, updates: { completed?: boolean; description?: string; title?: string }, token: string | null): Promise<TodoResponse> {
  return todosRPC.updateTodo(id, updates)
}

export async function deleteTodo(id: number, token: string | null): Promise<void> {
  return todosRPC.deleteTodo(id)
}
