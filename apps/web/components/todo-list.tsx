'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Todo } from '@server/schemas';

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
    <div className="space-y-4">
      {todos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">タスクがありません</h3>
          <p className="text-gray-500">新しいタスクを追加して始めましょう</p>
        </div>
      ) : (
        todos.map((todo) => (
          <Card key={todo.id} className="p-6 bg-white/70 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) => 
                    handleToggle(todo.id, checked as boolean)
                  }
                  className="mt-1 w-5 h-5 border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600"
                />
                <div className="flex-1">
                  {editingId === todo.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">タイトル</label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="タイトルを入力..."
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">備考</label>
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="備考を入力..."
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(todo.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {todo.title}
                      </h3>
                      <div className="mt-2">
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
                          className="text-xs px-2 py-1 h-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 mt-2"
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
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                削除
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}