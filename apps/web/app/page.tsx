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

  const handleUpdateDescription = async (id: number, description: string) => {
    const token = await getToken();
    await updateTodo(id, { description }, token);
    
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
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Todo App</h1>
        <UserButton />
      </div>
      <div className="space-y-6">
        <TodoForm onAdd={handleAddTodo} />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TodoList 
            initialTodos={todos} 
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onUpdateDescription={handleUpdateDescription}
          />
        )}
      </div>
    </main>
  );
}