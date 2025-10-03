'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { TodoList } from '@/components/todo-list';
import { getTodosAction, toggleTodoAction, updateTodoAction, deleteTodoAction } from '@/lib/api';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Todo } from '@server/schemas';

type SortOption = 'created' | 'title' | 'completed' | 'pending';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchTodos = async () => {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const result = await getTodosAction();
        if (result.error) {
          console.error('Failed to fetch todos:', result.error);
        } else {
          setTodos(result.todos);
        }
      } catch {
        console.error('Failed to fetch todos');
      }
      setLoading(false);
    };

    fetchTodos();
  }, [isLoaded, isSignedIn]);

  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('completed', completed.toString());
      
      const result = await toggleTodoAction(formData);
      if (result.success) {
        // Refresh todos
        const refreshResult = await getTodosAction();
        if (refreshResult.todos) {
          setTodos(refreshResult.todos);
        }
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleUpdateTodo = async (id: number, updates: { title?: string; description?: string }) => {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());
      
      if (updates.title) {
        formData.append('title', updates.title);
      }
      if (updates.description !== undefined) {
        formData.append('description', updates.description);
      }
      
      const result = await updateTodoAction(formData);
      if (result.success) {
        // Refresh todos
        const refreshResult = await getTodosAction();
        if (refreshResult.todos) {
          setTodos(refreshResult.todos);
        }
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const sortTodos = (todos: Todo[], sortBy: SortOption) => {
    const sortedTodos = [...todos];
    
    switch (sortBy) {
      case 'title':
        return sortedTodos.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
      case 'completed':
        return sortedTodos.sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? -1 : 1;
        });
      case 'pending':
        return sortedTodos.sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        });
      case 'created':
      default:
        return sortedTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  const sortedTodos = sortTodos(todos, sortBy);

  const handleDeleteTodo = async (id: number) => {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());
      
      const result = await deleteTodoAction(formData);
      if (result.success) {
        // Refresh todos
        const refreshResult = await getTodosAction();
        if (refreshResult.todos) {
          setTodos(refreshResult.todos);
        }
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
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
            <Link 
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Home
            </Link>
            <UserButton />
          </div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Todos
              </h1>
              <p className="text-gray-600 mt-1">タスクリストを管理しましょう</p>
            </div>
            <Link href="/todos/create">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                新しいタスク
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-80 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">読み込み中...</p>
            </div>
          ) : (
            <>
              {/* Sort Controls */}
              <div className="mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">並び順</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSortBy('created')}
                      variant={sortBy === 'created' ? 'default' : 'outline'}
                      className={sortBy === 'created' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0' : 'bg-white/50 hover:bg-white/70'}
                    >
                      作成日
                    </Button>
                    <Button
                      onClick={() => setSortBy('title')}
                      variant={sortBy === 'title' ? 'default' : 'outline'}
                      className={sortBy === 'title' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0' : 'bg-white/50 hover:bg-white/70'}
                    >
                      タイトル
                    </Button>
                    <Button
                      onClick={() => setSortBy('pending')}
                      variant={sortBy === 'pending' ? 'default' : 'outline'}
                      className={sortBy === 'pending' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0' : 'bg-white/50 hover:bg-white/70'}
                    >
                      未完了
                    </Button>
                    <Button
                      onClick={() => setSortBy('completed')}
                      variant={sortBy === 'completed' ? 'default' : 'outline'}
                      className={sortBy === 'completed' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0' : 'bg-white/50 hover:bg-white/70'}
                    >
                      完了
                    </Button>
                  </div>
                </div>
              </div>

              <TodoList 
                initialTodos={sortedTodos} 
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onUpdateTodo={handleUpdateTodo}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
