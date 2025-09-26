import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { todos } from './schema'

const sqlite = new Database('todos.db')
export const db = drizzle(sqlite, { schema: { todos } })

export { todos } from './schema'
export type { Todo, NewTodo } from './schema'