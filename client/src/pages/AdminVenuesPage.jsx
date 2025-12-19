import { useEffect, useState } from 'react';
import { fetchVenues, createVenue } from '../api/venuesApi';
import { getCurrentUser } from '../auth';
import '../styles/AdminVenuesPage.css';

function AdminVenuesPage() {
  const user = getCurrentUser();
  const [venues, setVenues] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('classroom');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [equipment, setEquipment] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const loadVenues = async () => {
    try {
      const data = await fetchVenues();
      setVenues(data);
    } catch {
      setError('Failed to load venues');
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-venues-page">
        <div className="admin-venues-card">
          <p className="admin-venues-denied">Access denied. Admins only.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      const equipArray = equipment
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await createVenue({
        name,
        type,
        capacity: Number(capacity),
        location,
        equipment: equipArray,
      });

      setMsg('Venue created successfully');
      setName('');
      setType('classroom');
      setCapacity('');
      setLocation('');
      setEquipment('');
      await loadVenues();
    } catch {
      setError(
        'Failed to create venue (maybe name already used or not admin).'
      );
    }
  };

  return (
    <div className="admin-venues-page">
      <div className="admin-venues-card">
        <div className="admin-venues-header">
          <h1>Manage venues</h1>
          <p>Create and review all campus venues.</p>
        </div>

        {msg && <div className="admin-venues-alert success">{msg}</div>}
        {error && <div className="admin-venues-alert error">{error}</div>}

        <form className="venue-form" onSubmit={handleSubmit}>
          <h2>Add new venue</h2>

          <div className="venue-form-row">
            <div className="venue-field">
              <label htmlFor="venue-name">Name</label>
              <input
                id="venue-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. CSE Seminar Hall"
              />
            </div>

            <div className="venue-field">
              <label htmlFor="venue-type">Type</label>
              <select
                id="venue-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
                <option value="hall">Hall</option>
                <option value="auditorium">Auditorium</option>
                <option value="meeting_room">Meeting room</option>
              </select>
            </div>

            <div className="venue-field">
              <label htmlFor="venue-capacity">Capacity</label>
              <input
                id="venue-capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                min={1}
                placeholder="e.g. 120"
              />
            </div>
          </div>

          <div className="venue-field">
            <label htmlFor="venue-location">Location</label>
            <input
              id="venue-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. Block B, 3rd floor"
            />
          </div>

          <div className="venue-field">
            <label htmlFor="venue-equipment">
              Equipment (comma separated)
            </label>
            <input
              id="venue-equipment"
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="Projector, AC, Mic"
            />
          </div>

          <button type="submit" className="venue-submit-btn">
            Create venue
          </button>
        </form>

        <div className="venues-list-section">
          <h2>Existing venues</h2>
          {venues.length === 0 ? (
            <p className="venues-empty">No venues yet.</p>
          ) : (
            <ul className="venues-list">
              {venues.map((v) => (
                <li key={v._id} className="venue-item">
                  <div className="venue-item-header">
                    <span className="venue-name">{v.name}</span>
                    <span className="venue-type-chip">{v.type}</span>
                  </div>
                  <div className="venue-meta">
                    <span>{v.location}</span>
                    <span className="dot">•</span>
                    <span>Capacity: {v.capacity}</span>
                  </div>
                  {v.equipment && v.equipment.length > 0 && (
                    <div className="venue-equipment-row">
                      <span className="equip-label">Equipment:</span>
                      <span className="equip-list">
                        {v.equipment.join(', ')}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminVenuesPage;
