'use server'

import { revalidatePath } from 'next/cache'
import { db, todos } from '@server/db/index'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

// Server Actions for Todo management

export async function createTodoAction(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { error: 'Authentication required' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title?.trim()) {
      return { error: 'Title is required' }
    }

    const [newTodo] = await db.insert(todos).values({
      title: title.trim(),
      description: description?.trim() || null,
      userId,
      completed: false,
    }).returning()

    revalidatePath('/todos')
    
    return { success: true, todo: newTodo }
  } catch (error) {
    console.error('Create todo action error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function updateTodoAction(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { error: 'Authentication required' }
    }

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

    const [updatedTodo] = await db.update(todos)
      .set(updates)
      .where(and(eq(todos.id, Number(id)), eq(todos.userId, userId)))
      .returning()

    if (!updatedTodo) {
      return { error: 'Todo not found or unauthorized' }
    }

    revalidatePath('/todos')
    revalidatePath(`/todos/${id}`)
    
    return { success: true, todo: updatedTodo }
  } catch (error) {
    console.error('Update todo action error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function deleteTodoAction(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { error: 'Authentication required' }
    }

    const id = formData.get('id') as string

    if (!id || isNaN(Number(id))) {
      return { error: 'Valid todo ID is required' }
    }

    const [deletedTodo] = await db.delete(todos)
      .where(and(eq(todos.id, Number(id)), eq(todos.userId, userId)))
      .returning()

    if (!deletedTodo) {
      return { error: 'Todo not found or unauthorized' }
    }

    revalidatePath('/todos')
    return { success: true }
  } catch (error) {
    console.error('Delete todo action error:', error)
    return { 
      error : error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function toggleTodoAction(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { error: 'Authentication required' }
    }

    const id = formData.get('id') as string
    const completed = formData.get('completed') === 'true'

    if (!id || isNaN(Number(id))) {
      return { error: 'Valid todo ID is required' }
    }

    const [updatedTodo] = await db.update(todos)
      .set({ completed })
      .where(and(eq(todos.id, Number(id)), eq(todos.userId, userId)))
      .returning()

    if (!updatedTodo) {
      return { error: 'Todo not found or unauthorized' }
    }

    revalidatePath('/todos')
    
    return { success: true, todo: updatedTodo }
  } catch (error) {
    console.error('Toggle todo action error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

// Server-side function for getting todos 
export async function getTodosAction() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { todos: [], error: null }
    }

    const todoList = await db.select().from(todos).where(eq(todos.userId, userId))
    
    return { todos: todoList, error: null }
  } catch (error) {
    console.error('Get todos action error:', error)
    return { 
      todos: [], 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

// Legacy client-side functions for backwards compatibility (will be deprecated)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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