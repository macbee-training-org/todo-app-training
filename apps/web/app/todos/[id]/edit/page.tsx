'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { getTodos, updateTodo } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import type { Todo } from '@server/schemas';

export default function EditTodoPage() {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  
  // Get the todo ID from the URL params
  const todoId = parseInt(useParams()?.id as string);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const fetchTodo = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const todos = await getTodos(token);
        const foundTodo = todos.find((t: Todo) => t.id === todoId);
        
        if (!foundTodo) {
          alert('Task not found');
          router.push('/todos');
          return;
        }
        
        setTodo(foundTodo);
        setTitle(foundTodo.title);
        setDescription(foundTodo.description || '');
      } catch (error) {
        console.error('Failed to fetch todo:', error);
        alert('Failed to load task');
        router.push('/todos');
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [todoId, isSignedIn, getToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const token = await getToken();
      await updateTodo(todoId, { title, description }, token);
      router.push(`/todos/${todoId}`);
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('タスクの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading task...</p>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Task not found</p>
          <Link
            href="/todos"
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Todo List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-10">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Link 
              href={`/todos/${todoId}`}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← タスク詳細に戻る
            </Link>
            <UserButton />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              タスクを編集
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-80 pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
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
                <Link href={`/todos/${todoId}`}>
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
                  disabled={saving || !title.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
