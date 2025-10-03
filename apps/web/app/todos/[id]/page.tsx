'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { getTodosAction, updateTodoAction, deleteTodoAction } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import type { Todo } from '@server/schemas';

export default function TodoDetailPage() {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useAuth();
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
        const result = await getTodosAction();
        if (result.error) {
          console.error('Failed to fetch todos:', result.error);
          alert('Failed to load task');
          router.push('/todos');
          return;
        }
        
        const foundTodo = result.todos.find((t: Todo) => t.id === todoId);
        
        if (!foundTodo) {
          alert('Task not found');
          router.push('/todos');
          return;
        }
        
        setTodo(foundTodo);
      } catch (error) {
        console.error('Failed to fetch todo:', error);
        alert('Failed to load task');
        router.push('/todos');
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [todoId, isSignedIn, router]);

  const handleToggleComplete = async () => {
    if (!todo) return;

    try {
      const formData = new FormData();
      formData.append('id', todoId.toString());
      formData.append('completed', (!todo.completed).toString());
      
      const result = await updateTodoAction(formData);
      if (result.success) {
        setTodo({ ...todo, completed: !todo.completed });
      } else {
        alert('Failed to update task');
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const formData = new FormData();
      formData.append('id', todoId.toString());
      
      const result = await deleteTodoAction(formData);
      if (result.success) {
        router.push('/todos');
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      alert('Failed to delete task');
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
              href="/todos"
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Todoリストに戻る
            </Link>
            <UserButton />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              タスク詳細
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-80 pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={handleToggleComplete}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {todo.title}
                  </h2>
                  {todo.description && (
                    <p className={`text-gray-600 ${
                      todo.completed ? 'line-through' : ''
                    }`}>
                      {todo.description}
                    </p>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    Created: {new Date(todo.createdAt).toLocaleDateString()}
                    {todo.completed && (
                      <span className="ml-4 text-green-600 font-medium">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/todos/${todoId}/edit`)}
                >
                  編集
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  削除
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}