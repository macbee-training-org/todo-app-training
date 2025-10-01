'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Todo } from '@/lib/types';

interface TodoListProps {
  initialTodos: Todo[];
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdateDescription: (id: number, description: string) => Promise<void>;
}

export function TodoList({ initialTodos, onToggle, onDelete, onUpdateDescription }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');

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

  const handleStartEdit = (id: number, currentDescription: string) => {
    setEditingId(id);
    setEditDescription(currentDescription || '');
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await onUpdateDescription(id, editDescription);
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, description: editDescription } : todo
      ));
      setEditingId(null);
      setEditDescription('');
    } catch {
      // エラー時は編集をキャンセル
      setEditingId(null);
      setEditDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
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
                {editingId === todo.id ? (
                  <div className="mt-2 space-y-2">
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="備考を入力..."
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(todo.id)}
                        className="text-xs px-2 py-1"
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="text-xs px-2 py-1"
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    {todo.description ? (
                      <p className={`text-sm text-gray-600 ${todo.completed ? 'line-through' : ''}`}>
                        {todo.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">備考なし</p>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(todo.id, todo.description || '')}
                      className="text-xs px-1 py-0 h-auto text-gray-500 hover:text-gray-700"
                    >
                      編集
                    </Button>
                  </div>
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