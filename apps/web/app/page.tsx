'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { TodoList } from '@/components/todo-list';
import { TodoForm } from '@/components/todo-form';
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/lib/api';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
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
      } catch {
        console.error('Failed to fetch todos');
      }
      setLoading(false);
    };

    fetchTodos();
  }, [isLoaded, isSignedIn, getToken]);

  const handleAddTodo = async (title: string, description?: string) => {
    const token = await getToken();
    await createTodo(title, description, token);
    
  const data = await getTodos(token);
  setTodos(data);
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    const token = await getToken();
    await updateTodo(id, { completed }, token);
    
  const data = await getTodos(token);
  setTodos(data);
  };

  const handleUpdateTodo = async (id: number, updates: { title?: string; description?: string }) => {
    const token = await getToken();
    await updateTodo(id, updates, token);
    
  const data = await getTodos(token);
  setTodos(data);
  };

  const handleDeleteTodo = async (id: number) => {
    const token = await getToken();
    await deleteTodo(id, token);
    
  const data = await getTodos(token);
  setTodos(data);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-10">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Todo App
              </h1>
              <p className="text-gray-600 mt-1">タスクを効率的に管理しましょう</p>
            </div>
            <UserButton />
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <TodoForm onAdd={handleAddTodo} />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-72 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">読み込み中...</p>
            </div>
          ) : (
            <TodoList 
              initialTodos={todos} 
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onUpdateTodo={handleUpdateTodo}
            />
          )}
        </div>
      </div>
    </main>
  );
}