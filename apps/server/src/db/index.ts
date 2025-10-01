import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL || 
  'postgres://postgres:postgres@localhost:5432/todo_db';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// schemaから明示的にエクスポート
export { todos } from './schema.js';