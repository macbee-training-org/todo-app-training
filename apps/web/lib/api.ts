const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Debug function to test API connectivity
export async function testApiConnection() {
  try {
    console.log('Testing API connection to:', API_URL);
    const res = await fetch(`${API_URL}/test-todos`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('API test failed:', res.status, res.statusText);
      throw new Error(`API test failed: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('API test successful:', data);
    return data;
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
}

export async function getTodos(token: string | null) {
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/todos`, {
    headers,
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function createTodo(title: string, description: string | undefined, token: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, description })
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(id: number, updates: { completed?: boolean; description?: string; title?: string }, token: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number, token: string | null) {
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete todo');
  return res.json();
}