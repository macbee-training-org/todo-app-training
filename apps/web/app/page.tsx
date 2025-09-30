'use client';
import { useState, useEffect } from 'react';
import { TodoList } from '@/components/todo-list';
import { TodoForm } from '@/components/todo-form';
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/lib/api';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    setLoading(true);
    const data = await getTodos();
    setTodos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (title: string) => {
    await createTodo(title);
    fetchTodos();
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    await updateTodo(id, completed);
    fetchTodos();
  };

  const handleDeleteTodo = async (id: number) => {
    await deleteTodo(id);
    fetchTodos();
  };

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
          />
        )}
      </div>
    </main>
  );
}