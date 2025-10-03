'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Get auth headers for RPC calls
async function getRpcAuthHeaders() {
  const { userId, getToken } = await auth()
  const token = await getToken()
  
  if (!userId || !token) {
    throw new Error('Authentication required')
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Server Actions calling RPC endpoints directly
export async function createTodoAction(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title?.trim()) {
      return { error: 'Title is required' }
    }

    // Call RPC endpoint
    const headers = await getRpcAuthHeaders()
    const response = await fetch(`${baseURL}/rpc/createTodo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        title: title.trim(), 
        description: description?.trim() 
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create todo')
    }
    
    const todo = await response.json()
    revalidatePath('/todos')
    return { success: true, todo }
  } catch (error) {
    console.error('Create todo action error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function updateTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const completed = formData.get('completed') === 'true'

    if (!id || isNaN(Number(id))) {
      return { error: 'Valid todo ID is required' }
    }

    const updates: { title?: string; description?: string; completed?: boolean } = {}
    if (title?.trim()) updates.title = title.trim()
    if (description?.trim()) updates.description = description.trim()
    if (formData.has('completed')) updates.completed = completed

    if (Object.keys(updates).length === 0) {
      return { error: 'No updates provided' }
    }

    // Call RPC endpoint
    const headers = await getRpcAuthHeaders()
    const response = await fetch(`${baseURL}/rpc/updateTodo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: Number(id), ...updates })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update todo')
    }
    
    const todo = await response.json()
    revalidatePath('/todos')
    revalidatePath(`/todos/${id}`)
    return { success: true, todo }
  } catch (error) {
    console.error('Update todo action error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function deleteTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string

    if (!id || isNaN(Number(id))) {
      return { error: 'Valid todo ID is required' }
    }

    // Call RPC endpoint
    const headers = await getRpcAuthHeaders()
    const response = await fetch(`${baseURL}/rpc/deleteTodo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: Number(id) })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete todo')
    }
    
    revalidatePath('/todos')
    return { success: true }
  } catch (error) {
    console.error('Delete todo action error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function toggleTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const completed = formData.get('completed') === 'true'

    if (!id || isNaN(Number(id))) {
      return { error: 'Valid todo ID is required' }
    }

    // Call RPC endpoint
    const headers = await getRpcAuthHeaders()
    const response = await fetch(`${baseURL}/rpc/updateTodo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: Number(id), completed })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to toggle todo')
    }
    
    const todo = await response.json()
    revalidatePath('/todos')
    return { success: true, todo }
  } catch (error) {
    console.error('Toggle todo action error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function getTodosAction() {
  try {
    // Call RPC endpoint
    const headers = await getRpcAuthHeaders()
    const response = await fetch(`${baseURL}/rpc/getTodos`, {
      method: 'POST',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch todos')
    }
    
    const todos = await response.json()
    return { todos, error: null }
  } catch (error) {
    console.error('Get todos action error:', error)
    return { 
      todos: [], 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}