'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Todo } from '@/lib/types';

interface TodoListProps {
  initialTodos: Todo[];
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoList({ initialTodos, onToggle, onDelete }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const handleToggle = async (id: number, completed: boolean) => {
    await onToggle(id, completed);
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed } : todo
    ));
  };

  const handleDelete = async (id: number) => {
    await onDelete(id);
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <Card key={todo.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) => 
                handleToggle(todo.id, checked as boolean)
              }
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.title}
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(todo.id)}
          >
            削除
          </Button>
        </Card>
      ))}
    </div>
  );
}