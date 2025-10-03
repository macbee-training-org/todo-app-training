import { serve } from 'bun'
import apiApp from './api/index.js'
import rpcApp from './api/rpc.js'

// Export type for RPC client
export type AppType = typeof rpcApp

const port = process.env.PORT || 3001

console.log(`🚀 RPC Server is running on port ${port}`)
console.log(`📡 Available endpoints:`)
console.log(`   - http://localhost:${port}/`)
console.log(`   - /rpc/getTodos`)
console.log(`   - /rpc/createTodo`)
console.log(`   - /rpc/updateTodo`)
console.log(`   - /rpc/deleteTodo`)

export default {
  port,
  fetch: apiApp.fetch,
}