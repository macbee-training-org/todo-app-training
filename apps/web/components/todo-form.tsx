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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="新しいTodoを入力..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? '追加中...' : '追加'}
        </Button>
      </div>
      <Input
        type="text"
        placeholder="備考（任意）..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
        className="w-full"
      />
    </form>
  );
}