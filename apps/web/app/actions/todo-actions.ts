'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuth } from '@clerk/nextjs/server'
import type { CreateTodoInput, UpdateTodoInput } from '../../../server/src/schemas'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper function to make authenticated API calls
async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const { getToken } = await getAuth()
  if (!getToken) {
    throw new Error('User not authenticated')
  }

  const token = await getToken()
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
}

// Server Actions for Todo management

export async function createTodoAction(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title || title.trim().length === 0) {
      throw new Error('Title is required')
    }

    const input: CreateTodoInput = {
      title: title.trim(),
      ...(description && description.trim().length > 0 && { description: description.trim() })
    }

    const response = await makeAuthenticatedRequest('/rpc', {
      method: 'POST',
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create todo')
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create todo')
    }

    // Revalidate the todos page to show the new todo
    revalidatePath('/todos')
    
    // Optionally redirect to todos list
    redirect('/todos')
  } catch (error) {
    console.error('Error creating todo:', error)
    throw error
  }
}

export async function updateTodoAction(todoId: number, input: UpdateTodoInput) {
  try {
    const response = await makeAuthenticatedRequest(`/todos/${todoId}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update todo')
    }

    // Revalidate relevant pages
    revalidatePath('/todos')
    revalidatePath(`/todos/${todoId}`)
    revalidatePath(`/todos/${todoId}/edit`)
  } catch (error) {
    console.error('Error updating todo:', error)
    throw error
  }
}

export async function deleteTodoAction(todoId: number) {
  try {
    const response = await makeAuthenticatedRequest(`/todos/${todoId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete todo')
    }

    // Revalidate and redirect to todos list
    revalidatePath('/todos')
    redirect('/todos')
  } catch (error) {
    console.error('Error deleting todo:', error)
    throw error
  }
}

export async function toggleTodoAction(todoId: number, completed: boolean) {
  try {
    await updateTodoAction(todoId, { completed })
  } catch (error) {
    console.error('Error toggling todo:', error)
    throw error
  }
}

// Server-side data fetching functions

export async function getTodosAction(): Promise<any[]> {
  try {
    const response = await makeAuthenticatedRequest('/rpc')

    if (!response.ok) {
      throw new Error('Failed to fetch todos')
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
}

export async function getTodoAction(todoId: number): Promise<any> {
  try {
    const todos = await getTodosAction()
    const todo = todos.find((t) => t.id === todoId)
    
    if (!todo) {
      throw new Error('Todo not found')
    }

    return todo
  } catch (error) {
    console.error('Error fetching todo:', error)
    throw error
  }
}
