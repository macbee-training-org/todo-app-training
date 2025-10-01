'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TodoFormProps {
  onAdd: (title: string, description?: string) => Promise<void>;
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onAdd(title, description || undefined);
      setTitle('');
      setDescription('');
    } catch {
      // エラー時の処理（必要ならUIで表示）
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="新しいTodoを入力..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className="flex-1 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !title.trim()}
          className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              追加中...
            </div>
          ) : (
            '追加'
          )}
        </Button>
      </div>
      <Input
        type="text"
        placeholder="備考（任意）..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
        className="w-full h-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200"
      />
    </form>
  );
}