'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getTodos, updateTodo, deleteTodo } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import type { Todo } from '@/lib/types';

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
    if (!confirm('Are you sure you want to delete this task?')) return;\n\n    try {\n      const token = await getToken();\n      await deleteTodo(todoId, token);\n      router.push('/todos');\n    } catch (error) {\n      console.error('Failed to delete todo:', error);\n      alert('Failed to delete task');\n    }\n  };\n\n  if (loading) {\n    return (\n      <div className=\"min-h-screen bg-gray-100 flex items-center justify-center\">\n        <p className=\"text-gray-600\">Loading task...</p>\n      </div>\n    );\n  }\n\n  if (!todo) {\n    return (\n      <div className=\"min-h-screen bg-gray-100 flex items-center justify-center\">\n        <div className=\"text-center\">\n          <p className=\"text-gray-600 mb-4\">Task not found</p>\n          <Link\n            href=\"/todos\"\n            className=\"text-blue-600 hover:text-blue-800\"\n          >\n            Return to Todo List\n          </Link>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8\">\n      <div className=\"max-w-2xl w-full\">\n        <div className=\"flex items-center justify-between mb-8\">\n          <Link\n            href=\"/todos\"\n            className=\"text-blue-600 hover:text-blue-800 flex items-center gap-2\"\n          >\n            <svg className=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M15 19l-7-7 7-7\" />\n            </svg>\n            Back to Todos\n          </Link>\n          <h1 className=\"text-3xl font-bold text-gray-900\">Task Details</h1>\n        </div>\n\n        <Card className=\"p-8\">\n          <div className=\"space-y-6\">\n            <div className=\"flex items-start space-x-4\">\n              <Checkbox\n                checked={todo.completed}\n                onCheckedChange={handleToggleComplete}\n                className=\"mt-1\"\n              />\n              <div className=\"flex-1\">\n                <h2 className={`text-2xl font-bold mb-2 ${\n                  todo.completed ? 'line-through text-gray-500' : 'text-gray-900'\n                }`}>\n                  {todo.title}\n                </h2>\n                {todo.description && (\n                  <p className={`text-gray-600 ${\n                    todo.completed ? 'line-through' : ''\n                  }`}>\n                    {todo.description}\n                  </p>\n                )}\n                <div className=\"mt-4 text-sm text-gray-500\">\n                  Created: {new Date(todo.createdAt).toLocaleDateString()}\n                  {todo.completed && (\n                    <span className=\"ml-4 text-green-600 font-medium\">\n                      ✓ Completed\n                    </span>\n                  )}\n                </div>\n              </div>\n            </div>\n\n            <div className=\"flex justify-end space-x-4 pt-6 border-t\">\n              <Button\n                variant=\"outline\"\n                onClick={() => router.push(`/todos/${todoId}/edit`)}\n              >\n                Edit Task\n              </Button>\n              <Button\n                variant=\"destructive\"\n                onClick={handleDelete}\n              >\n                Delete Task\n              </Button>\n            </div>\n          </div>\n        </Card>\n      </div>\n    </div>\n  );\n}
