'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const handleToggle = async (id: number, completed: boolean) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed } : todo
    ));
    try {
      await onToggle(id, completed);
    } catch {
      setTodos(todos);
    }
  };

  const handleDelete = async (id: number) => {
    const previousTodos = todos;
    setTodos(todos.filter(todo => todo.id !== id));
    try {
      await onDelete(id);
    } catch {
      setTodos(previousTodos);
    }
  };

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <Card key={todo.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) => 
                  handleToggle(todo.id, checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                  {todo.title}
                </span>
                {todo.description && (
                  <p className={`text-sm text-gray-600 mt-1 ${todo.completed ? 'line-through' : ''}`}>
                    {todo.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(todo.id)}
            >
              削除
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}