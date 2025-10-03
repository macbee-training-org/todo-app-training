'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getTodos, updateTodo, deleteTodo } from '@/lib/api-rpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import type { Todo } from '../../../../server/src/schemas';

export default function TodoDetailPage({ params }: { params: { id: string } }) {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const todoId = parseInt(params.id);

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
        const foundTodo = todos.find((t) => t.id === todoId);
        
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
  }, [todoId, isSignedIn, getToken, router]);

  const handleToggleComplete = async () => {
    if (!todo) return;

    try {
      const token = await getToken();
      await updateTodo(todoId, { completed: !todo.completed }, token);
      setTodo({ ...todo, completed: !todo.completed });
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = await getToken();
      await deleteTodo(todoId, token);
      router.push('/todos');
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/todos"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Todos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
        </div>

        <Card className="p-8">
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
                Edit Task
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete Task
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}