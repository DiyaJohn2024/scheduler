const API_BASE_URL = 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

export async function fetchMyBookings() {
  const res = await fetch(`${API_BASE_URL}/api/bookings/mine`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load my bookings');
  return res.json();
}

export async function fetchPendingBookings() {
  const res = await fetch(`${API_BASE_URL}/api/bookings/pending`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load pending bookings');
  return res.json();
}

export async function decideBooking(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/decision`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update booking');
  return res.json();
}
