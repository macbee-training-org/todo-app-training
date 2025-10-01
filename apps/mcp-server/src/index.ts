#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// TodoアプリのベースURL（ローカル開発環境）
const API_BASE_URL = 'http://localhost:3001';
// ClerkのユーザーIDを設定（実際のユーザーIDに置き換える必要があります）
const USER_ID = 'user_33Pe1G5JgFD0fw7eaKfFaRgzbJM'; // TODO: 実際のユーザーIDに変更

const server = new Server(
  {
    name: 'todo-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツール一覧の定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_todos',
        description: 'Get all todos',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_todo',
        description: 'Create a new todo',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the todo',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'update_todo',
        description: 'Update a todo (mark as completed/incomplete)',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The ID of the todo',
            },
            completed: {
              type: 'boolean',
              description: 'Whether the todo is completed',
            },
          },
          required: ['id', 'completed'],
        },
      },
      {
        name: 'delete_todo',
        description: 'Delete a todo',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The ID of the todo',
            },
          },
          required: ['id'],
        },
      },
    ],
  };
});

// ツール実行のハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_todos': {
        const response = await fetch(`${API_BASE_URL}/mcp/todos`);
        const todos = await response.json();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(todos, null, 2),
            },
          ],
        };
      }
      case 'create_todo': {
        const { title } = args as { title: string };
        const response = await fetch(`${API_BASE_URL}/mcp/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        const todo = await response.json();
        return {
          content: [
            {
              type: 'text',
              text: `Created todo: ${JSON.stringify(todo, null, 2)}`,
            },
          ],
        };
      }
      case 'update_todo': {
        const { id, completed } = args as { id: number; completed: boolean };
        const response = await fetch(`${API_BASE_URL}/mcp/todos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed }),
        });
        const todo = await response.json();
        return {
          content: [
            {
              type: 'text',
              text: `Updated todo: ${JSON.stringify(todo, null, 2)}`,
            },
          ],
        };
      }
      case 'delete_todo': {
        const { id } = args as { id: number };
        await fetch(`${API_BASE_URL}/mcp/todos/${id}`, {
          method: 'DELETE',
        });
        return {
          content: [
            {
              type: 'text',
              text: `Deleted todo with ID: ${id}`,
            },
          ],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// サーバー起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Todo MCP Server running on stdio');
}

main().catch(console.error);