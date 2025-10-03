// Server Actions for Todo management
'use server'

import { revalidatePath } from 'next/cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper function for authenticated API calls on server
async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Note: In a real implementation, you'd need to pass the actual request context
  // For now, we'll skip authentication validation in Server Actions
  // and rely on the client-side token validation
  
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

// Server Actions
export async function createTodoAction(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title?.trim()) {
      return { error: 'Title is required' }
    }

    const res = await makeAuthenticatedRequest('/todos', {
      method: 'POST',
      body: JSON.stringify({ title: title.trim(), description: description?.trim() })
    })

    if (!res.ok) {
      const errorData = await res.json()
      return { error: errorData.message || 'Failed to create todo' }
    }

    const todo = await res.json()
    revalidatePath('/todos')
    
    return { success: true, todo }
  } catch (error) {
    console.error('Create todo action error:', error)
    return { error: 'An unexpected error occurred' }
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

    const res = await makeAuthenticatedRequest(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })

    if (!res.ok) {
      const errorData = await res.json()
      return { error: errorData.message || 'Failed to update todo' }
    }

    const todo = await res.json()
    revalidatePath('/todos')
    revalidatePath(`/todos/${id}`)
    
    return { success: true, todo }
  } catch (error) {
    console.error('Update todo action error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string

    if (!id || isNaN(Number(id))) {
      return { error: 'Valid todo ID is required' }
    }

    const res = await makeAuthenticatedRequest(`/todos/${id}`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      const errorData = await res.json()
      return { error: errorData.message || 'Failed to delete todo' }
    }

    revalidatePath('/todos')
    return { success: true }
  } catch (error) {
    console.error('Delete todo action error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function toggleTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const completed = formData.get('completed') === 'true'

    if (!id || isNaN(Number(id))) {
      return { error: 'Valid todo ID is required' }
    }

    const res = await makeAuthenticatedRequest(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed })
    })

    if (!res.ok) {
      const errorData = await res.json()
      return { error: errorData.message || 'Failed to toggle todo' }
    }

    const todo = await res.json()
    revalidatePath('/todos')
    
    return { success: true, todo }
  } catch (error) {
    console.error('Toggle todo action error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Legacy client-side functions for backwards compatibility
export async function getTodos(token: string | null) {
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/todos`, {
    headers,
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

// Wrapper functions that use Server Actions internally
export async function createTodo(title: string, description: string | undefined, token: string | null) {
  // This should ideally be replaced with Server Actions, but keeping for compatibility
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers,
        body: JSON.stringify({ title, description })
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(id: number, updates: { completed?: boolean; description?: string; title?: string }, token: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number, token: string | null) {
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete todo');
  return res.json();
}