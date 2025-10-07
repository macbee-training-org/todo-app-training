'use server'

import { revalidatePath } from 'next/cache'
import { hc } from 'hono/client'
import type { AppType } from '../../server/api/index'
import { CreateTodoSchema, UpdateTodoSchema } from '../../server/src/schemas'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Hono RPCクライアントの作成
const client = hc(baseURL)

// Get auth headers for RPC calls
async function getRpcHeaders() {
  return {
    'Authorization': 'Bearer test-token',
    'Content-Type': 'application/json'
  }
}

// Server Actions using typed Hono RPC
export async function createTodoAction(formData: FormData) {
  try {
    // zodバリデーション
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string
    }

    const validationResult = CreateTodoSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0]?.message || 'Invalid input' }
    }

    const { title, description } = validationResult.data

    const headers = await getRpcHeaders()
    
    const response = await (client as any).rpc.createTodo.$post(
      {
        json: {
          title: title.trim(),
          description: description?.trim() || ''
        }
      },
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Create todo error:', errorText)
      throw new Error('Failed to create todo')
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

export async function getTodosAction() {
  try {
    console.log('Fetching todos from:', `${baseURL}/rpc/getTodos`)
    
    const headers = await getRpcHeaders()
    
    const response = await (client as any).rpc.getTodos.$post(
      { json: {} },
      { headers }
    )

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Get todos error response:', errorText)
      throw new Error('Failed to fetch todos')
    }

    const todos = await response.json()
    console.log('Fetched todos:', todos)
    
    return { todos, error: null }
  } catch (error) {
    console.error('Get todos action error:', error)
    return {
      todos: [],
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

export async function updateTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    
    if (!id || isNaN(Number(id))) {
      return { error: 'Valid todo ID is required' }
    }

    // zodバリデーション
    const rawData: any = {}
    if (formData.has('title')) rawData.title = formData.get('title') as string
    if (formData.has('description')) rawData.description = formData.get('description') as string
    if (formData.has('completed')) rawData.completed = formData.get('completed') === 'true'

    if (Object.keys(rawData).length === 0) {
      return { error: 'No updates provided' }
    }

    const validationResult = UpdateTodoSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0]?.message || 'Invalid input' }
    }

    const updates = validationResult.data

    const headers = await getRpcHeaders()
    const response = await (client as any).rpc.updateTodo.$post(
      {
        json: {
          id: Number(id),
          ...updates
        }
      },
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Update todo error:', errorText)
      throw new Error('Failed to update todo')
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

    const headers = await getRpcHeaders()
    const response = await (client as any).rpc.deleteTodo.$post(
      { 
        json: { id: Number(id) }
      },
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Delete todo error:', errorText)
      throw new Error('Failed to delete todo')
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

    const headers = await getRpcHeaders()
    const response = await (client as any).rpc.updateTodo.$post(
      {
        json: {
          id: Number(id),
          completed
        }
      },
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Toggle todo error:', errorText)
      throw new Error('Failed to toggle todo')
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