const API_BASE_URL = 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchVenues() {
  const res = await fetch(`${API_BASE_URL}/api/venues`);
  if (!res.ok) throw new Error('Failed to load venues');
  return res.json();
}

export async function createVenue(payload) {
  const res = await fetch(`${API_BASE_URL}/api/venues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create venue');
  return res.json();
}
