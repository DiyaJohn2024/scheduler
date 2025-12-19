import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEventById, updateEvent } from '../api/eventsApi';
import '../styles/EditEventPage.css';

const EVENT_TYPES = ['technical', 'cultural', 'placement', 'workshop', 'sports', 'other'];

function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('technical');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [clubOrDept, setClubOrDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const ev = await fetchEventById(id);
        setTitle(ev.title || '');
        setDescription(ev.description || '');
        setType(ev.type || 'technical');
        setClubOrDept(ev.clubOrDept || '');

        const start = new Date(ev.startTime);
        const end = new Date(ev.endTime);

        const sd = [
          start.getFullYear(),
          String(start.getMonth() + 1).padStart(2, '0'),
          String(start.getDate()).padStart(2, '0'),
        ].join('-');
        const ed = [
          end.getFullYear(),
          String(end.getMonth() + 1).padStart(2, '0'),
          String(end.getDate()).padStart(2, '0'),
        ].join('-');

        const st = [
          String(start.getHours()).padStart(2, '0'),
          String(start.getMinutes()).padStart(2, '0'),
        ].join(':');
        const et = [
          String(end.getHours()).padStart(2, '0'),
          String(end.getMinutes()).padStart(2, '0'),
        ].join(':');

        setStartDate(sd);
        setEndDate(ed);
        setStartTime(st);
        setEndTime(et);
      } catch {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      const start = new Date(`${startDate}T${startTime}:00`);
      const end = new Date(`${endDate}T${endTime}:00`);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        setError('Please provide a valid start/end date and time.');
        return;
      }

      await updateEvent(id, {
        title,
        description,
        type,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        clubOrDept,
      });

      setMsg('Event updated successfully!');
      setTimeout(() => navigate('/events/mine'), 500);
    } catch (err) {
      setError('Failed to update event (maybe approved booking or auth issue).');
    }
  };

  if (loading) return <div style={{ padding: '1rem' }}>Loading event...</div>;
  if (error && !msg) return <div style={{ padding: '1rem', color: 'red' }}>{error}</div>;

  // 👉 Styled return block
  return (
    <div className="edit-event-page">
      <div className="edit-event-card">
        <h1>Edit Event</h1>

        {msg && (
          <div className="edit-event-msg edit-event-msg--success">
            {msg}
          </div>
        )}
        {error && (
          <div className="edit-event-msg edit-event-msg--error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-event-form">
          <div className="edit-form-field">
            <label>Title</label>
            <input
              className="edit-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="edit-form-field">
            <label>Description</label>
            <textarea
              className="edit-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="edit-form-field">
            <label>Type</label>
            <select
              className="edit-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="edit-form-row">
            <div className="edit-form-field">
              <label>Start date</label>
              <input
                className="edit-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="edit-form-field">
              <label>End date</label>
              <input
                className="edit-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="edit-form-field">
              <label>Start time</label>
              <input
                className="edit-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="edit-form-field">
              <label>End time</label>
              <input
                className="edit-input"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="edit-event-submit">
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditEventPage;
