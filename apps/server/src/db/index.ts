import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'
import { todos } from './schema'

const sqlite = new Database('todos.db')
export const db = drizzle(sqlite, { schema: { todos } })

export { todos } from './schema'
export type { Todo, NewTodo } from './schema'