const API_BASE_URL = 'http://localhost:5000';

export async function fetchVenues() {
  const res = await fetch(`${API_BASE_URL}/api/venues`);
  if (!res.ok) throw new Error('Failed to load venues');
  return res.json();
}
