import { TodoList } from '@/components/todo-list';
import { TodoForm } from '@/components/todo-form';
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/lib/api';

export default async function Home() {
  const todos = await getTodos();

  const handleAddTodo = async (title: string) => {
    'use server';
    await createTodo(title);
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    'use server';
    await updateTodo(id, completed);
  };

  const handleDeleteTodo = async (id: number) => {
    'use server';
    await deleteTodo(id);
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Todo App</h1>
      <div className="space-y-6">
        <TodoForm onAdd={handleAddTodo} />
        <TodoList 
          initialTodos={todos} 
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
        />
      </div>
    </main>
  );
}