'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { TodoList } from '@/components/todo-list';
import { TodoForm } from '@/components/todo-form';
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/lib/api';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import type { Todo } from '@/lib/types';

type SortOption = 'created' | 'title' | 'completed' | 'pending';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetchTodos = async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getTodos(token);
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, [isLoaded, isSignedIn, getToken]);

  const handleAddTodo = async (title: string, description?: string) => {
    const token = await getToken();
    await createTodo(title, description, token);
    await fetchTodos();
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    const token = await getToken();
    await updateTodo(id, { completed }, token);
    await fetchTodos();
  };

  const handleDeleteTodo: (id: number) => Promise<void> = async (id: number) => {
    const token = await getToken();
    await deleteTodo(id, token);
    await fetchTodos();
  };

  const sortedTodos = todos.sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'completed':
        return (a.completed === b.completed) ? 0 : (a.completed ? 1 : -1);
      case 'pending':
        return (a.completed === b.completed) ? 0 : (a.completed ? -1 : 1);
      default:
        return 0;
    }
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading application...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Todo Management</h1>
          <p className="text-gray-600 mb-6">Please login to access your tasks:</p>
          <div className="space-y-4">
            <Link
              href="/sign-in"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Main Page
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <TodoForm onAddTodo={handleAddTodo} />

        <div className="flex items-center justify-between">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="created">Created</option>
            <option value="title">Title</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : (
          <TodoList
            todos={sortedTodos}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        )}
      </div>
    </div>
  );
}
