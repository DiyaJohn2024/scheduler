import { useState } from 'react';
import { createEvent } from '../api/eventsApi';
import '../styles/CreateEventPage.css';

const EVENT_TYPES = [
  'technical',
  'cultural',
  'placement',
  'workshop',
  'sports',
  'other',
];

function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('technical');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [clubOrDept, setClubOrDept] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setError('');

    try {
      // combine date + time into ISO strings
      const start = new Date(`${date}T${startTime}:00`);
      const end = new Date(`${date}T${endTime}:00`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError('Please provide valid date and time.');
        return;
      }
      if (end <= start) {
        setError('End time must be after start time.');
        return;
      }

      await createEvent({
        title,
        description,
        type,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        clubOrDept,
      });

      setStatusMsg('Event created successfully!');
      setTitle('');
      setDescription('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setClubOrDept('');
    } catch (err) {
      setError('Failed to create event.');
    }
  };

  return (
  <div className="create-event-page">
    <div className="create-event-card">
      <h1>Create Event (Dev Only)</h1>
      
      {statusMsg && <div className="status-msg status-success">{statusMsg}</div>}
      {error && <div className="status-msg status-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input 
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            className="form-input form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select 
            className="form-input form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="time-row">
          <div className="form-group">
            <label>Date</label>
            <input 
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Start time</label>
            <input 
              className="form-input"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>End time</label>
            <input 
              className="form-input"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Club / Department</label>
          <input 
            className="form-input"
            type="text"
            value={clubOrDept}
            onChange={(e) => setClubOrDept(e.target.value)}
          />
        </div>

        <button type="submit" className="create-btn">Create Event</button>
      </form>
    </div>
  </div>
);

}

export default CreateEventPage;
