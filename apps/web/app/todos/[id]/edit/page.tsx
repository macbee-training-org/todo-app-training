'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getTodos, updateTodo } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import type { Todo } from '@/lib/types';

export default function EditTodoPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    
    if (!title.trim()) {
      alert('Please enter a title for your task.');
      return;
    }

    setSaving(true);
    
    try {
      const token = await getToken();
      await updateTodo(todoId, { 
        title: title.trim(), 
        description: description.trim() || undefined 
      }, token);
      router.push(`/todos/${todoId}`);
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Failed to update task. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={`/todos/${todoId}`}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Task Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/todos/${todoId}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !title.trim()}
                className="min-w-24"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}