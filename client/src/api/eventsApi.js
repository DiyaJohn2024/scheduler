const API_BASE_URL = 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchEventById(id) {
  const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load event');
  return res.json();
} 

export async function fetchEvents(type) {
  const url = type
    ? `${API_BASE_URL}/api/events?type=${encodeURIComponent(type)}`
    : `${API_BASE_URL}/api/events`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function createEvent(payload) {
  const token = localStorage.getItem('token'); // temp storage

  const res = await fetch(`${API_BASE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to create event');
  }
  return res.json();
}

export async function fetchMyEvents() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch('http://localhost:5000/api/events/mine', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch my events');
  }

  return res.json();
}

export async function updateEvent(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update event');
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete event');
  return res.json();
}