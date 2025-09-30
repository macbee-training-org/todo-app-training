const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getTodos() {
  const res = await fetch(`${API_URL}/todos`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function createTodo(title: string) {
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(id: number, completed: boolean) {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number) {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete todo');
  return res.json();
}
