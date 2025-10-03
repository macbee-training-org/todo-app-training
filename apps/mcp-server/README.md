# MCP Server for Todo App

Claude Desktop用のMCP (Model Context Protocol) サーバーです。

## Setup

### 1. Install dependencies
```bash
bun install
```

### 2. Build 
```bash
bun run build
```

### 3. Claude Desktop Configuration

Claude Desktopの設定ファイル（`~/Library/Application Support/Claude/claude_desktop_config.json`）に以下を追加：

```json
{
  "mcpServers": {
    "todo-mcp-server": {
      "command": "node",
      "args": ["/Users/ebarasoraha/todo-app-training/apps/mcp-server/dist/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:3001"
      }
    }
  }
}
```

## Available Tools

- `list_todos` - Get all todos
- `create_todo {title: string}` - Create new todo
- `update_todo {id: number, completed: boolean}` - Update todo
- `delete_todo {id: number}` - Delete todo

## Requirements

Todo API Server should be running on localhost:3001:

```bash
cd apps/server && bun api/index.ts
```

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
