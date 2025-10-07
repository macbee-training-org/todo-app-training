import { z } from 'zod'

// Todo schemas for Hono RPC validation
export const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  createdAt: z.string(), // ISO string
  userId: z.string()
})

export const CreateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional()
})

export const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional()
})

// API Response schemas
export const TodoResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  createdAt: z.string()
})

export const TodosListResponseSchema = z.array(TodoResponseSchema)

// Export types for client usage  
export type TodoResponse = z.infer<typeof TodoResponseSchema>
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>
export type TodosListResponse = z.infer<typeof TodosListResponseSchema>

// For compatibility with existing code that expects Todo
export type Todo = TodoResponse
