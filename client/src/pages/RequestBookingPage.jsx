import { useEffect, useState } from 'react';
import { fetchMyEvents } from '../api/eventsApi';
import { fetchVenues } from '../api/venuesApi';
import { createBooking } from '../api/bookingsApi';
import '../styles/RequestBookingPage.css';

function RequestBookingPage() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [eventId, setEventId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [evs, vs] = await Promise.all([fetchMyEvents(), fetchVenues()]);
        setEvents(evs);
        setVenues(vs);
      } catch {
        setError('Failed to load events or venues');
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setError('');

    try {
      const start = new Date(`${date}T${startTime}:00`);
      const end = new Date(`${date}T${endTime}:00`);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        setError('Please provide a valid date and time range.');
        return;
      }

      await createBooking({
        eventId,
        venueId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      setStatusMsg('Booking request submitted!');
      setEventId('');
      setVenueId('');
      setDate('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      setError('Failed to submit booking (maybe conflict or auth issue).');
    }
  };

  return (
    <div className="request-page">
      <div className="request-card">
        <h1>Request venue booking</h1>
        <p className="request-subtitle">
          Choose one of your events, pick a venue and preferred time slot.
        </p>

        {statusMsg && (
          <div className="request-alert request-alert-success">
            {statusMsg}
          </div>
        )}
        {error && (
          <div className="request-alert request-alert-error">
            {error}
          </div>
        )}

        <form className="request-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="event">
              Select your event
            </label>
            <select
              id="event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            >
              <option value="">-- choose event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({new Date(ev.startTime).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="venue">
              Preferred venue
            </label>
            <select
              id="venue"
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              required
            >
              <option value="">-- choose venue --</option>
              {venues.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.location})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="start">Start time</label>
              <input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="end">End time</label>
              <input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="request-btn">
            Submit booking request
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestBookingPage;
