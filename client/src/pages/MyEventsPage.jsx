import { useEffect, useState } from 'react';
import { deleteEvent, fetchMyEvents } from '../api/eventsApi';
import { useNavigate } from 'react-router-dom';
import '../styles/MyEventsPage.css';

function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMyEvents();
        setEvents(data);
      } catch (err) {
        setError(
          'Failed to load your events (are you logged in as club_head/faculty?).'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="my-events-page">
        <div className="my-events-loading">Loading your events...</div>
      </div>
    );

  if (error)
    return (
      <div className="my-events-page">
        <div className="my-events-error">{error}</div>
      </div>
    );

  return (
    <div className="my-events-page">
      <div className="my-events-card">
        <h1>My events</h1>
        {events.length === 0 ? (
          <p className="my-events-empty">You have not created any events yet.</p>
        ) : (
          <ul className="my-events-list">
            {events.map((ev) => (
              <li key={ev._id} className="my-events-item">
                <div className="my-events-title">{ev.title}</div>
                <div className="my-events-time">
                  {new Date(ev.startTime).toLocaleString([], {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  –{' '}
                  {new Date(ev.endTime).toLocaleString([], {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="my-events-meta">
                  <span className="chip chip-type">
                    {ev.type || 'Uncategorised'}
                  </span>
                  {ev.confirmedVenue ? (
                    <span className="chip chip-venue">
                      Venue: {ev.confirmedVenue.name}
                    </span>
                  ) : (
                    <span className="chip chip-pending">Venue not allocated</span>
                  )}
                </div>

                <div className="my-events-actions">
                  {/* Navigate to edit page */}
                  <button
                    className="my-events-btn my-events-btn--primary"
                    onClick={() => navigate(`/events/${ev._id}/edit`)}
                  >
                    Update
                  </button>

                  <button
                    className="my-events-btn my-events-btn--danger"
                    onClick={async () => {
                      if (!window.confirm('Delete this event?')) return;
                      try {
                        await deleteEvent(ev._id);
                        window.location.reload();
                      } catch (err) {
                        console.error('Failed to delete event', err);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyEventsPage;
