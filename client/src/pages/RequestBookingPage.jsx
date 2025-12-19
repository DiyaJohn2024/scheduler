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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


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

  const handleEventChange = (e) => {
  const id = e.target.value;
  setEventId(id);

  const ev = events.find((ev) => ev._id === id);
  if (!ev) return;

  const start = new Date(ev.startTime);
  const end = new Date(ev.endTime);

  // yyyy-mm-dd in local time
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

  // hh:mm in local time
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
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setError('');

    try {
    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${endDate}T${endTime}:00`);

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
      setStartDate('');
      setEndDate('');
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
              onChange={handleEventChange}
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
    <label htmlFor="startDate">Start date</label>
    <input
      id="startDate"
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      required
    />
  </div>
  <div className="form-field">
    <label htmlFor="endDate">End date</label>
    <input
      id="endDate"
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
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
