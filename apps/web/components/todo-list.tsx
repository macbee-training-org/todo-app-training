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
  onUpdateTodo: (id: number, updates: { title?: string; description?: string }) => Promise<void>;
}

export function TodoList({ initialTodos, onToggle, onDelete, onUpdateTodo }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
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

  const handleStartEdit = (id: number, currentTitle: string, currentDescription: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setEditDescription(currentDescription || '');
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await onUpdateTodo(id, { title: editTitle, description: editDescription });
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, title: editTitle, description: editDescription } : todo
      ));
      setEditingId(null);
      setEditTitle('');
      setEditDescription('');
    } catch {
      // エラー時は編集をキャンセル
      setEditingId(null);
      setEditTitle('');
      setEditDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
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
                {editingId === todo.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">タイトル</label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="タイトルを入力..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">備考</label>
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="備考を入力..."
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(todo.id)}
                        className="text-xs px-3 py-1"
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="text-xs px-3 py-1"
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                      {todo.title}
                    </span>
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
                        onClick={() => handleStartEdit(todo.id, todo.title, todo.description || '')}
                        className="text-xs px-1 py-0 h-auto text-gray-500 hover:text-gray-700"
                      >
                        編集
                      </Button>
                    </div>
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