const API_BASE_URL = 'http://localhost:5000';

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
