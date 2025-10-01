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
    <main className="min-h-screen max-w-2xl mx-auto">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10">
        <div className="max-w-2xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">Todo App</h1>
            <UserButton />
          </div>
          <TodoForm onAdd={handleAddTodo} />
        </div>
      </div>

      {/* Separator Line */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-300 z-20" style={{ marginTop: '200px' }}>
        <div className="max-w-2xl mx-auto px-8">
          <div className="h-px bg-gray-300"></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-56 pb-8 px-8">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <TodoList 
            initialTodos={todos} 
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onUpdateTodo={handleUpdateTodo}
          />
        )}
      </div>
    </main>
  );
}