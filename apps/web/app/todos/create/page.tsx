'use client';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserButton } from '@clerk/nextjs';
import { createTodo } from '@/lib/api';

export default function CreateTodoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const token = await getToken();
      await createTodo(title, description, token);
      
      // Reset form
      setTitle('');
      setDescription('');
      
      // Redirect to todos list
      window.location.href = '/todos';
    } catch (error) {
      console.error('Failed to create todo:', error);
      alert('タスクの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-10">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Link 
              href="/todos"
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Todoリストに戻る
            </Link>
            <UserButton />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              新しいタスク
            </h1>
            <p className="text-gray-600 mt-1">新しいタスクを作成しましょう</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-80 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル *
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="タスクのタイトルを入力してください"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  詳細（任意）
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="タスクの詳細を入力してください"
                  rows={4}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Link href="/todos">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="px-6 py-3"
                  >
                    キャンセル
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading || !title.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {loading ? '作成中...' : '作成'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
