'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TodoFormProps {
  onAdd: (title: string) => Promise<void>;
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onAdd(title);
      router.refresh();
      setTitle(''); 
    } catch (error) {
      // エラー時の処理（必要ならUIで表示）
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
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
    </form>
  );
}